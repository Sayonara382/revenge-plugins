import { findByProps } from '@vendetta/metro';
import { before } from '@vendetta/patcher';
import { defaultRules } from './rules';

const MessageActions = findByProps('sendMessage', 'receiveMessage');

const URL_REGEX =
    /https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w._~!$&'()*+,;=:@]|%[0-9a-fA-F]{2})*)*(?:\?(?:[\w._~!$&'()*+,;=:@/?]|%[0-9a-fA-F]{2})*)?(?:#(?:[\w._~!$&'()*+,;=:@/?]|%[0-9a-fA-F]{2})*)?/g;

interface CompiledRule {
    pattern: RegExp;
    domainPattern?: RegExp;
    hasDomain: boolean;
}

const compileRule = (rule: string): CompiledRule => {
    const [paramPattern, domain] = rule.split('@');
    const escapedParam = paramPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '[^&]*');
    if (!domain) {
        return {
            pattern: new RegExp(`[?&]${escapedParam}(?:=[^&#]*)?(?=&|#|$)`, 'gi'),
            hasDomain: false
        };
    }
    const escapedDomain = domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '[^./]*');
    return {
        pattern: new RegExp(`[?&]${escapedParam}(?:=[^&#]*)?(?=&|#|$)`, 'gi'),
        domainPattern: new RegExp(escapedDomain, 'i'),
        hasDomain: true
    };
};

const COMPILED_RULES = defaultRules.map(compileRule);

const extractDomain = (url: string): string | null => {
    try {
        return new URL(url).hostname;
    } catch {
        const match = url.match(/https?:\/\/([^/?#]+)/i);
        return match ? match[1] : null;
    }
};

const cleanUrl = (url: string): string => {
    if (!url || url.length < 10) return url;
    const domain = extractDomain(url);
    if (!domain) return url;
    let cleaned = url;
    let hasChanges = false;
    try {
        for (const rule of COMPILED_RULES) {
            if (rule.hasDomain && rule.domainPattern && !rule.domainPattern.test(domain)) {
                continue;
            }
            rule.pattern.lastIndex = 0;
            const newCleaned = cleaned.replace(rule.pattern, '');
            if (newCleaned !== cleaned) {
                cleaned = newCleaned;
                hasChanges = true;
            }
        }
        if (hasChanges) {
            cleaned = cleaned
                .replace(/[?&]$/, '')
                .replace(/&{2,}/g, '&')
                .replace(/\?&/g, '?')
                .replace(/&(?=&#|\?|$)/g, '');
        }
        return cleaned;
    } catch {
        return url;
    }
};

const cleanMessageContent = (content: string): string => {
    if (!content || !content.includes('http')) return content;
    const urls = content.match(URL_REGEX);
    if (!urls) return content;
    let newContent = content;
    let hasChanges = false;
    for (const url of urls) {
        const cleaned = cleanUrl(url);
        if (cleaned !== url) {
            newContent = newContent.replace(url, cleaned);
            hasChanges = true;
        }
    }
    return hasChanges ? newContent : content;
};

const patches: (() => void)[] = [];

export const onLoad = () => {
    patches.push(
        before('sendMessage', MessageActions, (args) => {
            const message = args?.[1];
            if (!message?.content) return;

            const cleaned = cleanMessageContent(message.content);
            if (cleaned !== message.content) {
                message.content = cleaned;
            }
        }),
        before('receiveMessage', MessageActions, (args) => {
            const message = args?.[0];
            if (!message?.content) return;
            const cleaned = cleanMessageContent(message.content);
            if (cleaned !== message.content) {
                message.content = cleaned;
            }
        })
    );
};

export const onUnload = () => {
    patches.forEach((unpatch) => unpatch());
    patches.length = 0;
};

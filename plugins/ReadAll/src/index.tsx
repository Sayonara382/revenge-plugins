import { ReactNative as RN } from '@vendetta/metro/common';
import { Forms } from '@vendetta/ui/components';
import { findByProps } from '@vendetta/metro';
import { showToast } from '@vendetta/ui/toasts';
import { getAssetIDByName } from '@vendetta/ui/assets';
import { storage } from '@vendetta/plugin';
import { useProxy } from '@vendetta/storage';

const { FormSection, FormRow, FormSwitchRow, FormDivider } = Forms;

storage.markGuilds ??= true;
storage.markPrivate ??= false;

interface Guild {
    id: string;
    name: string;
}

interface Channel {
    id: string;
    type: number;
}

const GuildStore = findByProps("getGuilds", "getGuild");
const ChannelStore = findByProps('getChannel', 'getMutablePrivateChannels');
const ReadStateStore = findByProps('getUnreadCount', 'hasUnread');

const ReadStateActions =
    findByProps('markGuildAsRead', 'markChannelAsRead') ||
    findByProps('ackGuild', 'ackChannel') ||
    findByProps('markAsRead') ||
    findByProps('ack') ||
    findByProps('markGuildAsRead') ||
    findByProps('markChannelAsRead');

const markAllAsRead = async () => {
    if (storage.markGuilds && GuildStore) {
        const guilds = Object.values(GuildStore.getGuilds()) as Guild[];
        for (const guild of guilds) {
            if (guild?.id && ReadStateStore?.hasUnread?.(guild.id)) {
                if (ReadStateActions.markGuildAsRead) {
                    ReadStateActions.markGuildAsRead(guild.id);
                } else if (ReadStateActions.ackGuild) {
                    ReadStateActions.ackGuild(guild.id);
                } else if (ReadStateActions.markAsRead) {
                    ReadStateActions.markAsRead(guild.id);
                } else if (ReadStateActions.ack) {
                    ReadStateActions.ack(guild.id);
                }
            }
        }
    }
    
    if (storage.markPrivate && ChannelStore) {
        const privateChannels = Object.values(ChannelStore.getMutablePrivateChannels()) as Channel[];
        for (const channel of privateChannels) {
            if (channel?.id && ReadStateStore?.hasUnread?.(channel.id)) {
                if (ReadStateActions.markChannelAsRead) {
                    ReadStateActions.markChannelAsRead(channel.id);
                } else if (ReadStateActions.ackChannel) {
                    ReadStateActions.ackChannel(channel.id);
                } else if (ReadStateActions.markAsRead) {
                    ReadStateActions.markAsRead(channel.id);
                } else if (ReadStateActions.ack) {
                    ReadStateActions.ack(channel.id);
                }
            }
        }
    }

    showToast(`Marked all as read!`, getAssetIDByName('Check'));
};

export function settings() {
    useProxy(storage);

    return (
        <RN.ScrollView style={{ flex: 1 }}>
            <FormSection title="MARK OPTIONS">
                <FormSwitchRow
                    label="Mark Guild Channels"
                    subLabel="Mark all unread channels in servers as read"
                    leading={<FormRow.Icon source={getAssetIDByName('ic_guild_24px')} />}
                    value={storage.markGuilds}
                    onValueChange={(v: boolean) => {
                        storage.markGuilds = v;
                    }}
                />
                <FormDivider />
                <FormSwitchRow
                    label="Mark Private Channels"
                    subLabel="Mark all unread DMs and group chats as read"
                    leading={<FormRow.Icon source={getAssetIDByName('ic_message_24px')} />}
                    value={storage.markPrivate}
                    onValueChange={(v: boolean) => {
                        storage.markPrivate = v;
                    }}
                />
            </FormSection>
            <FormSection title="ACTIONS">
                <FormRow
                    label="Mark All as Read"
                    subLabel="Mark all selected channel types as read"
                    leading={<FormRow.Icon source={getAssetIDByName('ic_check_24px')} />}
                    onPress={markAllAsRead}
                    trailing={FormRow.Arrow}
                />
                <FormRow
                    label="Debug: Show Available Methods"
                    subLabel="Log available ReadStateActions methods to console"
                    leading={<FormRow.Icon source={getAssetIDByName('ic_info_24px')} />}
                    onPress={() => {
                        if (ReadStateActions) {
                            console.log('ReadStateActions methods:', Object.keys(ReadStateActions));
                            showToast(`Check console for available methods`, getAssetIDByName('ic_info_24px'));
                        } else {
                            showToast('ReadStateActions not found', getAssetIDByName('ic_warning_24px'));
                        }
                    }}
                    trailing={FormRow.Arrow}
                />
            </FormSection>
        </RN.ScrollView>
    );
}

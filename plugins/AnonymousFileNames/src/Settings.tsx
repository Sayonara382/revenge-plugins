import { React, ReactNative as RN } from '@vendetta/metro/common';
import { Forms } from '@vendetta/ui/components';
import { useProxy } from '@vendetta/storage';
import { storage } from '@vendetta/plugin';
import { getAssetIDByName } from '@vendetta/ui/assets';
import randomString from './lib/randomString';

const { FormSection, FormRow, FormInput, FormText } = Forms;

const MIN_LENGTH = 1;
const MAX_LENGTH = 20;

export default function Settings() {
    useProxy(storage);
    const [inputValue, setInputValue] = React.useState(storage.nameLength?.toString() || '8');
    const [error, setError] = React.useState<string | null>(null);
    
    const validateAndUpdate = (value: string) => {
        setInputValue(value);
        const numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue === '') {
            setError('File name length is required');
            return;
        }
        const length = parseInt(numericValue);
        if (length < MIN_LENGTH) {
            setError(`Minimum length is ${MIN_LENGTH}`);
            return;
        }
        if (length > MAX_LENGTH) {
            setError(`Maximum length is ${MAX_LENGTH}`);
            return;
        }
        setError(null);
        storage.nameLength = length;
        setInputValue(numericValue);
    };

    const getPreviewName = () => {
        const length = parseInt(inputValue) || 8;
        const validLength = Math.max(MIN_LENGTH, Math.min(MAX_LENGTH, length));
        return randomString(validLength);
    };

    return (
        <RN.ScrollView style={{ flex: 1 }}>
            <FormSection title="CONFIGURATION">
                <FormInput
                    value={inputValue}
                    onChange={(v: string) => validateAndUpdate(v)}
                    placeholder="8"
                    title="FILE NAME LENGTH"
                    keyboardType="numeric"
                    error={error}
                />
                <FormRow
                    label="Valid Range"
                    subLabel={`${MIN_LENGTH} - ${MAX_LENGTH} characters`}
                    leading={<FormRow.Icon source={getAssetIDByName('ic_info_filled_16px')} />}
                />
                <FormRow
                    label="Live Preview"
                    subLabel={`${getPreviewName()}.jpg`}
                    leading={<FormRow.Icon source={getAssetIDByName('ic_eye_24px')} />}
                />
            </FormSection>

            <FormSection title="INFORMATION">
                <FormRow
                    label="How It Works"
                    subLabel={`Files you upload will have their names replaced with random ${inputValue || '8'}-character strings while preserving the file extension`}
                    leading={<FormRow.Icon source={getAssetIDByName('ic_help_16px')} />}
                />
                <FormRow
                    label="Example"
                    subLabel={`"document.pdf" → "${getPreviewName()}.pdf"`}
                    leading={<FormRow.Icon source={getAssetIDByName('ic_show_24px')} />}
                />
            </FormSection>
        </RN.ScrollView>
    );
}

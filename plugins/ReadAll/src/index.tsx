import { ReactNative as RN } from '@vendetta/metro/common';
import { Forms } from '@vendetta/ui/components';
import { findByProps, findByStoreName } from '@vendetta/metro';
import { showToast } from '@vendetta/ui/toasts';
import { getAssetIDByName } from '@vendetta/ui/assets';
import { storage } from '@vendetta/plugin';
import { useProxy } from '@vendetta/storage';

const { FormSection, FormRow, FormSwitchRow } = Forms;

storage.markGuilds ??= true;
storage.markPrivate ??= false;

const GuildStore = findByStoreName('GuildStore');
const ChannelStore = findByProps('getChannel', 'getMutablePrivateChannels');
const ReadStateStore = findByProps('getUnreadCount', 'hasUnread');
const ReadStateActions = findByProps('markGuildAsRead', 'markChannelAsRead');

const markAllAsRead = async () => {
    try {
        let markedCount = 0;

        if (storage.markGuilds) {
            const guilds = Object.values(GuildStore.getGuilds()) as Array<{ id: string }>;
            for (const guild of guilds) {
                try {
                    if (ReadStateStore.hasUnread(guild.id)) {
                        await ReadStateActions.markGuildAsRead(guild.id);
                        markedCount++;
                    }
                } catch (e) {
                    console.log(`Failed to mark guild ${guild.id} as read:`, e);
                }
            }
        }

        if (storage.markPrivate) {
            const privateChannels = Object.values(ChannelStore.getMutablePrivateChannels()) as Array<{ id: string }>;
            for (const channel of privateChannels) {
                try {
                    if (ReadStateStore.hasUnread(channel.id)) {
                        await ReadStateActions.markChannelAsRead(channel.id);
                        markedCount++;
                    }
                } catch (e) {
                    console.log(`Failed to mark channel ${channel.id} as read:`, e);
                }
            }
        }

        showToast(`Marked ${markedCount} channels as read!`, getAssetIDByName('Check'));
    } catch (e) {
        console.log('Error in markAllAsRead:', e);
        showToast('Failed to mark all as read', getAssetIDByName('Small'));
    }
};

export function settings() {
    useProxy(storage);

    return (
        <RN.ScrollView style={{ flex: 1 }}>
            <FormSection title="MARK OPTIONS">
                <FormSwitchRow
                    label="Mark Guild Channels"
                    subLabel="Mark all unread channels in servers as read"
                    leading={<FormRow.Icon source={getAssetIDByName('ic_group_24px')} />}
                    value={storage.markGuilds}
                    onValueChange={(v: boolean) => {
                        storage.markGuilds = v;
                    }}
                />
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
            </FormSection>
        </RN.ScrollView>
    );
}

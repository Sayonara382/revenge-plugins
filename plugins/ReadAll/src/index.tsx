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

const GuildStore = findByProps("getGuilds", "getGuild");
const ChannelStore = findByProps('getChannel', 'getMutablePrivateChannels');
const ReadStateStore = findByProps('getUnreadCount', 'hasUnread');
const ReadStateActions = findByProps('markGuildAsRead', 'markChannelAsRead');

const markAllAsRead = async () => {
    if (storage.markGuilds) {
        const guilds = Object.values(GuildStore.getGuilds());
        for (const guild of guilds) {
            if (ReadStateStore.hasUnread(guild.id)) {
                ReadStateActions.markGuildAsRead(guild.id);
            }
        }
    }
    if (storage.markPrivate) {
        const privateChannels = Object.values(ChannelStore.getMutablePrivateChannels());
        for (const channel of privateChannels) {
            if (ReadStateStore.hasUnread(channel.id)) {
                ReadStateActions.markChannelAsRead(channel.id);
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
                    leading={<FormRow.Icon source={getAssetIDByName('ic_warning_24px')} />}
                    value={storage.markGuilds}
                    onValueChange={(v: boolean) => {
                        storage.markGuilds = v;
                    }}
                />
                <FormDivider />
                <FormSwitchRow
                    label="Mark Private Channels"
                    subLabel="Mark all unread DMs and group chats as read"
                    leading={<FormRow.Icon source={getAssetIDByName('ic_warning_24px')} />}
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
                <FormDivider />
            </FormSection>
        </RN.ScrollView>
    );
}

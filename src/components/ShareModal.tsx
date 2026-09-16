import { Button, Modal } from "@mantine/core";
import { ArticleIcon, TextAlignJustifyIcon } from "@phosphor-icons/react";
import { useEditor } from "@/src/context/EditorContext";
import { notifications } from "@mantine/notifications";

interface IShareModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function ShareModal({ opened, onClose }: IShareModalProps) {
  const { copyAsPlainText, copyAsRichText } = useEditor();

  const onClickCopyAsPlainText = async () => {
    try {
      await copyAsPlainText();
      notifications.show({
        title: "Success Copying as Plain Text",
        message: "Plain text note is now in your clipboard.",
      });
      onClose();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Failed Copying as Plain Text",
        message: (error as Error).message,
      });
    }
  };

  const onClickCopyAsRichText = async () => {
    try {
      await copyAsRichText();
      notifications.show({
        title: "Success Copying as Rich Text",
        message: "Rich text note is now in your clipboard.",
      });
      onClose();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Failed Copying as Rich Text",
        message: (error as Error).message,
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Share Note"
      classNames={{ body: "flex flex-col gap-4" }}
    >
      <Button
        fullWidth
        leftSection={<TextAlignJustifyIcon />}
        onClick={onClickCopyAsPlainText}
      >
        Copy as Markdown
      </Button>
      <Button
        fullWidth
        leftSection={<ArticleIcon />}
        onClick={onClickCopyAsRichText}
      >
        Copy as Rich Text
      </Button>
    </Modal>
  );
}

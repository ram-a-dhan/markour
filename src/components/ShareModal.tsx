import { Button, Modal } from "@mantine/core";
import { MarkdownLogoIcon, MicrosoftWordLogoIcon } from "@phosphor-icons/react";
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
        title: "Success Copying as Markdown",
        message: "Markdown note is now in your clipboard.",
      });
      onClose();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Failed Copying as Markdown",
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
      overlayProps={{ blur: 2 }}
    >
      <Button
        fullWidth
        leftSection={<MarkdownLogoIcon />}
        onClick={onClickCopyAsPlainText}
      >
        Copy As Markdown
      </Button>
      <Button
        fullWidth
        leftSection={<MicrosoftWordLogoIcon />}
        onClick={onClickCopyAsRichText}
      >
        Copy As Rich Text
      </Button>
    </Modal>
  );
}

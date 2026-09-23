import { Kbd, Modal, SimpleGrid, Table, type TableData } from "@mantine/core";

const editorGuideData: TableData = {
  body: [
    [
      <>
        <Kbd>/</Kbd>
      </>,
      <>
        Open Block Commands
      </>,
    ],
    [
      <>
        <Kbd>/</Kbd> + <code>heading</code>
      </>,
      <>
        Insert Heading
      </>,
    ],
    [
      <>
        <Kbd>/</Kbd> + <code>quote</code>
      </>,
      <>
        Insert Quote Block
      </>,
    ],
    [
      <>
        <Kbd>/</Kbd> + <code>divider</code>
      </>,
      <>
        Insert Divider
      </>,
    ],
    [
      <>
        <Kbd>/</Kbd> + <code>bullet</code>
      </>,
      <>
        Insert Bullet List
      </>,
    ],
    [
      <>
        <Kbd>/</Kbd> + <code>ordered</code>
      </>,
      <>
        Insert Numbered List
      </>,
    ],
    [
      <>
        <Kbd>/</Kbd> + <code>task</code>
      </>,
      <>
        Insert Checkbox List
      </>,
    ],
    [
      <>
        <Kbd>/</Kbd> + <code>image</code>
      </>,
      <>
        Insert Image
      </>,
    ],
    [
      <>
        <Kbd>/</Kbd> + <code>code</code>
      </>,
      <>
        Insert Code Block
      </>,
    ],
    [
      <>
        <Kbd>/</Kbd> + <code>table</code>
      </>,
      <>
        Insert Table
      </>,
    ],
    [
      <>
        <Kbd>/</Kbd> + <code>math</code>
      </>,
      <>
        Insert Math Block
      </>,
    ],
  ],
};

const markdownGuideData: TableData = {
  body: [
    [
      <>
        <Kbd>#</Kbd> &times; 1-6 + <Kbd>Space</Kbd>
      </>,
      <>
        <code className="whitespace-nowrap"># Text</code>&ensp;or&ensp;<code className="whitespace-nowrap">## Text</code> or so on...
      </>,
      <>
        <b className="font-serif">Heading</b>
      </>,
    ],
    [
      <>
        <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd>
      </>,
      <></>,
      <>
        Line Break
      </>,
    ],
    [
      <>
        <Kbd>Ctrl</Kbd> + <Kbd>B</Kbd>
      </>,
      <>
        <code>**Text**</code> or <code>__Text__</code>
      </>,
      <>
        <b>Bold</b>
      </>,
    ],
    [
      <>
        <Kbd>Ctrl</Kbd> + <Kbd>I</Kbd>
      </>,
      <>
        <code>*Text*</code> or <code>_Text_</code>
      </>,
      <>
        <i>Italic</i>
      </>,
    ],
    [
      <>
        <Kbd>Ctrl</Kbd> + <Kbd>Alt</Kbd> + <Kbd>X</Kbd>
      </>,
      <>
        <code>~Text~</code>
      </>,
      <>
        <s>Strikethrough</s>
      </>,
    ],
    [
      <>
        <Kbd>-</Kbd> + <Kbd>Space</Kbd>
      </>,
      <>
        <code className="whitespace-nowrap">- Text</code>
      </>,
      <>
        &bull;&ensp;Bullet List
      </>,
    ],
    [
      <>
        <Kbd>1</Kbd> + <Kbd>.</Kbd> + <Kbd>Space</Kbd>
      </>,
      <>
        <code className="whitespace-nowrap">1. Text</code>
      </>,
      <>
        1.&ensp;Numbered List
      </>,
    ],
    [
      <></>,
      <>
        <code className="whitespace-nowrap">- [ ] Text</code> or <code className="whitespace-nowrap">- [x] Text</code>
      </>,
      <>
        <input type="checkbox" checked readOnly tabIndex={-1} />&ensp;Task List
      </>,
    ],
    [
      <>
        <Kbd>Ctrl</Kbd> + <Kbd>E</Kbd>
      </>,
      <>
        <code>`Text`</code>
      </>,
      <>
        <code>Inline Code</code>
      </>,
    ],
    [
      <></>,
      <>
        <code>$Text$</code>
      </>,
      <>
        <i className="font-serif">Inline Math</i>
      </>,
    ],
    [
      <>
        <Kbd>&gt;</Kbd> + <Kbd>Space</Kbd>
      </>,
      <>
        <code className="whitespace-nowrap">&gt; Text</code>
      </>,
      <>
        <i className="border-l-2">&ensp;Quote Block</i>
      </>,
    ],
    [
      <>
        <Kbd>`</Kbd> + <Kbd>`</Kbd> + <Kbd>`</Kbd> + <Kbd>Enter</Kbd>
      </>,
      <>
        <code>```</code>
      </>,
      <>
        <code className="bg-[black] text-[white] px-1 py-0.5">Code Block</code>
      </>,
    ],
    [
      <>
        <Kbd>$</Kbd> + <Kbd>$</Kbd> + <Kbd>Enter</Kbd>
      </>,
      <>
        <code>$$</code>
      </>,
      <>
        <i className="bg-[black] text-[white] px-1 py-0.5 font-serif">Math Block</i>
      </>,
    ],
    [
      <>
        <Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd>
      </>,
      <></>,
      <>
        Escape Block
      </>,
    ],
    [
      <>
        <Kbd>-</Kbd> + <Kbd>-</Kbd> + <Kbd>-</Kbd> + <Kbd>Enter</Kbd>
      </>,
      <>
        <code>---</code>
      </>,
      <>
        Divider
      </>,
    ],
  ],
};

interface IHelpModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function HelpModal({ opened, onClose }: IHelpModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Editor Guide"
      size="auto"
      overlayProps={{ blur: 2 }}
    >
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <div>
          <h2 className="font-bold mb-2">
            Empty Line Commands
          </h2>

          <Table
            data={editorGuideData}
            highlightOnHover
          />
        </div>

        <div>
          <h2 className="font-bold mb-2">
            Markdown Syntax
          </h2>

          <Table
            data={markdownGuideData}
            highlightOnHover
          />
        </div>
      </SimpleGrid>
    </Modal>
  );
}

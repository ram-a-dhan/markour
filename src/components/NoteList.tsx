import { ActionIcon, AppShell, ScrollArea, Tooltip } from "@mantine/core";

const notes = [
  {
    title: "Dolor voluptatem maiores nam illum",
    content:
      "Repellat aliquid alias nisi omnis veniam. Libero unde asperiores nemo, porro consequatur voluptatibus dolorem. Impedit, rerum error!",
  },
  {
    title: "Dicta quisquam dolore facilis",
    content:
      "Fuga atque recusandae reprehenderit perspiciatis vero cupiditate. Possimus pariatur iste vel saepe nihil rem nam dignissimos obcaecati totam.",
  },
  {
    title: "Beatae asperiores repellendus",
    content:
      "Inventore in id quas nisi doloremque eligendi esse itaque, autem excepturi quos adipisci similique assumenda laboriosam, animi dolores mollitia.",
  },
  {
    title: "Dolorem culpa",
    content:
      "Consequatur expedita, iste, minima commodi ducimus placeat soluta non a dolores nulla. Ex commodi illum explicabo, nam nulla aut unde.",
  },
  {
    title: "Eligendi",
    content:
      "Nam corrupti, libero itaque, beatae quaerat, nostrum architecto doloribus velit consequuntur magni aliquam harum officiis ad quisquam veritatis temporibus suscipit quae.",
  },
];

interface INoteListProps {
  openDrawer: () => void;
  openedNavbarMobile: boolean;
  closeNavbarMobile: () => void;
}

export default function NoteList({
  openDrawer,
  openedNavbarMobile,
  closeNavbarMobile,
}: INoteListProps) {
  const onClickNavbarItem = () => {
    if (openedNavbarMobile) closeNavbarMobile();
  };

  return (
    <AppShell.Navbar>
      {/* NOTE TOOLBAR */}
      <AppShell.Section
        p="md"
        h={60}
        className="grow-0 shrink-0 flex items-center justify-between border-b border-b-(--app-shell-border-color) overflow-hidden"
      >
        <Tooltip label="Settings">
          <ActionIcon onClick={openDrawer}>⚙️</ActionIcon>
        </Tooltip>

        <h2>Notes</h2>

        <Tooltip label="Create New Note">
          <ActionIcon onClick={onClickNavbarItem}>✏️</ActionIcon>
        </Tooltip>
      </AppShell.Section>

      {/* NOTE LIST */}
      <AppShell.Section
        className="overscroll-contain"
        grow
        component={ScrollArea}
      >
        {notes.map((item, index) => (
          <div
            key={index}
            onClick={onClickNavbarItem}
            className="p-4 cursor-pointer hover:bg-(--mantine-color-default-hover) active:bg-(--mantine-color-default-border) select-none"
          >
            <p className="mb-1">{item.title}</p>
            <p className="text-xs text-(--mantine-color-dimmed) line-clamp-1">
              {item.content}
            </p>
          </div>
        ))}
      </AppShell.Section>
    </AppShell.Navbar>
  );
}

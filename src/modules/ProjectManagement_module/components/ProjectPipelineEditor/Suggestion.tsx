import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';

import MentionList from './MentionList';
import { cardMentionMember } from '../CardModalActivity';

export default {
  items: ({ query }: { query: string }) => {
    query = query.replaceAll('_', ' ');
    const arrayOfMention = cardMentionMember.filter((item) =>
      item.toLowerCase().startsWith(query.toLowerCase())
    );
    return [...new Set(arrayOfMention)];
  },

  render: () => {
    let component: any;
    let popup: any;
    return {
      onStart: ({ ...props }) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });
        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate({ ...props }) {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }
        const position = props.editor.state.selection.from;
        const last = props.editor.state.doc.textBetween(position - 1, position);

        if (last === ' ') {
          props.editor
            .chain()
            .setTextSelection({ from: position - 1, to: position })
            .insertContent('_')
            .run();
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown({ ...props }) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }
        return component.ref?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};

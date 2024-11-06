import './styles/index.css';
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Blockquote from '@tiptap/extension-blockquote';
import Placeholder from '@tiptap/extension-placeholder';
import BulletList from '@tiptap/extension-bullet-list';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';
import OrderedList from '@tiptap/extension-ordered-list';
import CodeBlock from '@tiptap/extension-code-block';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
// import HardBreak from '@tiptap/extension-hard-break'
import Underline from '@tiptap/extension-underline';
import {
  EditorProvider,
  JSONContent,
  useCurrentEditor,
} from '@tiptap/react';
import Mention from '@tiptap/extension-mention';
import StarterKit from '@tiptap/starter-kit';
import suggestion from './Suggestion';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ColorPlate from './ColorPlate';

const MenuBar = () => {
  const [highlightColor, setHighlightColor] = useState('#ffc078');
  const [showHeading, setShowHeading] = useState(false);
  const [heading, setHeading] = useState('Heading 1');
  const [showFontType, setShowFontType] = useState(false);
  const [fontType, setFontType] = useState('Sans Serif');
  const [showColor, setShowColor] = useState(false);
  const [col, setColor] = useState('rgb(0,0,0)');
  const [hFontStyle,setHFontStyle] = useState('');
  const [showHighlight, setShowHightLight] = useState(false);
  const { editor } = useCurrentEditor();
  if (!editor) {
    return null;
  }
  const headingRef = useRef<HTMLDivElement>(null);
  const fontTypeRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      headingRef.current &&
      !headingRef.current.contains(event.target as Node) &&
      fontTypeRef.current &&
      !fontTypeRef.current.contains(event.target as Node) &&
      colorRef.current &&
      !colorRef.current.contains(event.target as Node) &&
      highlightRef.current &&
      !highlightRef.current.contains(event.target as Node)
    ) {
      setShowHeading(false);
      setShowFontType(false);
      setShowColor(false);
      setShowHightLight(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  

  return (
    <div className="control-group border-b p-2">
      <div className="button-group flex flex-wrap gap-3 flex-col">
        <div className="flex gap-6">
          <div className="relative" ref={headingRef}>
            <button
              type="button"
              className={`
                ${
                  editor.isActive('heading') ? 'is-active text-blue-600' : ''
                } text-[14px] leading-none inline-flex gap-1 items-center shrink-0 hover:text-blue-600`}
              onClick={() => {
                setShowHeading(!showHeading);
                setShowFontType(false);
                setShowColor(false);
                setShowHightLight(false);
              }}
            >
              {heading}
              <svg
                baseProfile="tiny"
                viewBox="0 0 24 24"
                fill="currentColor"
                height="16px"
                width="16px"
              >
                <path d="M18.2 9.3L12 3 5.8 9.3c-.2.2-.3.4-.3.7s.1.5.3.7c.2.2.4.3.7.3h11c.3 0 .5-.1.7-.3.2-.2.3-.5.3-.7s-.1-.5-.3-.7zM5.8 14.7L12 21l6.2-6.3c.2-.2.3-.5.3-.7s-.1-.5-.3-.7c-.2-.2-.4-.3-.7-.3h-11c-.3 0-.5.1-.7.3-.2.2-.3.5-.3.7s.1.5.3.7z" />
              </svg>
            </button>
            {showHeading ? (
              <ul className="list-none bg-white border rounded-md absolute left-0 w-36 bottom-full !m-0 !px-1 !py-2">
                <li className="leading-none text-[18px] ">
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().toggleHeading({ level: 1 }).run();
                      setHeading('Heading 1');
                      setShowHeading(false);
                    }}
                    className={`
                      ${
                        editor.isActive('heading', { level: 1 })
                          ? 'is-active text-blue-600'
                          : ''
                      } block w-full text-left transition-colors hover:text-blue-600 p-2 `}
                  >
                    Heading 1
                  </button>
                </li>
                <li className="leading-none text-[16px]">
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().toggleHeading({ level: 2 }).run();
                      setHeading('Heading 2');
                      setShowHeading(false);
                    }}
                    className={`
                    ${
                      editor.isActive('heading', { level: 2 })
                        ? 'is-active text-blue-600'
                        : ''
                    } block w-full text-left transition-colors hover:text-blue-600 p-2 `}
                  >
                    Heading 2
                  </button>
                </li>
                <li className="leading-none text-[14px]">
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().toggleHeading({ level: 3 }).run();
                      setHeading('Heading 3');
                      setShowHeading(false);
                    }}
                    className={`
                    ${
                      editor.isActive('heading', { level: 3 })
                        ? 'is-active text-blue-600'
                        : ''
                    } block w-full text-left transition-colors hover:text-blue-600 p-2 `}
                  >
                    Heading 3
                  </button>
                </li>
              </ul>
            ) : (
              <></>
            )}
          </div>
          <div className="relative" ref={fontTypeRef}>
            <button
              type="button"
              className={`${
                editor.isActive('textStyle', { fontFamily: hFontStyle })
                  ? 'is-active text-blue-600'
                  : ''
              } text-[15px] leading-none inline-flex gap-1 items-center shrink-0 hover:text-blue-600`}
              onClick={() => {
                setShowFontType(!showFontType);
                setShowHeading(false);
                setShowColor(false);
                setShowHightLight(false);
              }}
            >
              {fontType}
              <svg
                baseProfile="tiny"
                viewBox="0 0 24 24"
                fill="currentColor"
                height="16px"
                width="16px"
              >
                <path d="M18.2 9.3L12 3 5.8 9.3c-.2.2-.3.4-.3.7s.1.5.3.7c.2.2.4.3.7.3h11c.3 0 .5-.1.7-.3.2-.2.3-.5.3-.7s-.1-.5-.3-.7zM5.8 14.7L12 21l6.2-6.3c.2-.2.3-.5.3-.7s-.1-.5-.3-.7c-.2-.2-.4-.3-.7-.3h-11c-.3 0-.5.1-.7.3-.2.2-.3.5-.3.7s.1.5.3.7z" />
              </svg>
            </button>
            {showFontType ? (
              <ul className="list-none bg-white border rounded-md absolute left-0 w-36 bottom-full !m-0 !px-1 !py-2">
                <li className="font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setFontFamily('sans-serif').run();
                      setFontType('Sans Serif');
                      setHFontStyle('sans-serif')
                      setShowFontType(false);
                    }}
                    className={`
                      ${
                        editor.isActive('textStyle', { fontFamily: 'sans-serif' })
                          ? 'is-active text-blue-600'
                          : ''
                      } p-2 text-[12px] block w-full text-left transition-colors hover:text-blue-600 `}
                    data-test-id="sans-serif"
                  >
                    Sans Serif
                  </button>
                </li>
                <li className="font-serif">
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setFontFamily('serif').run();
                      setFontType('Serif');
                      setHFontStyle('serif')
                      setShowFontType(false);
                    }}
                    className={`
                        ${
                          editor.isActive('textStyle', { fontFamily: 'serif' })
                            ? 'is-active text-blue-600'
                            : ''
                        }  p-2 text-[12px] block w-full text-left transition-colors hover:text-blue-600`}
                    data-test-id="serif"
                  >
                    Serif
                  </button>
                </li>
                <li className="font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setFontFamily('monospace').run();
                      setFontType('Monospace');
                      setHFontStyle('monospace')
                      setShowFontType(false);
                    }}
                    className={`
                        ${
                          editor.isActive('textStyle', { fontFamily: 'monospace' })
                            ? 'is-active text-blue-600'
                            : ''
                        } p-2 text-[12px] block w-full text-left transition-colors hover:text-blue-600 `}
                    data-test-id="monospace"
                  >
                    Monospace
                  </button>
                </li>
              </ul>
            ) : (
              <></>
            )}
          </div>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`${
              editor.isActive('bold') ? 'is-active text-blue-600' : ''
            } w-6 h-6 flex items-center justify-center hover:text-blue-600`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" height="16px" width="16px">
              <path
                fillRule="evenodd"
                d="M6 4.75c0-.69.56-1.25 1.25-1.25h5a4.75 4.75 0 013.888 7.479A5 5 0 0114 20.5H7.25c-.69 0-1.25-.56-1.25-1.25V4.75zM8.5 13v5H14a2.5 2.5 0 000-5H8.5zm0-2.5h3.751A2.25 2.25 0 0012.25 6H8.5v4.5z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`${
              editor.isActive('italic') ? 'is-active text-blue-600' : ''
            } w-6 h-6 flex items-center justify-center hover:text-blue-600`}
          >
            <svg
              data-name="Layer 1"
              viewBox="0 0 24 24"
              fill="currentColor"
              height="22px"
              width="22px"
            >
              <path d="M17 6h-6a1 1 0 000 2h1.52l-3.2 8H7a1 1 0 000 2h6a1 1 0 000-2h-1.52l3.2-8H17a1 1 0 000-2z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`${
              editor.isActive('underline') ? 'is-active text-blue-600' : ''
            } w-6 h-6 flex items-center justify-center hover:text-blue-600 `}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" height="18px" width="18px">
              <path d="M5 21h14v-2H5v2m7-4a6 6 0 006-6V3h-2.5v8a3.5 3.5 0 01-3.5 3.5A3.5 3.5 0 018.5 11V3H6v8a6 6 0 006 6z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={` ${
              editor.isActive('blockquote') ? 'is-active text-blue-600' : ''
            } w-6 h-6 flex items-center justify-center hover:text-blue-600`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" height="18px" width="18px">
              <path d="M20.309 17.708C22.196 15.66 22.006 13.03 22 13V5a1 1 0 00-1-1h-6c-1.103 0-2 .897-2 2v7a1 1 0 001 1h3.078a2.89 2.89 0 01-.429 1.396c-.508.801-1.465 1.348-2.846 1.624l-.803.16V20h1c2.783 0 4.906-.771 6.309-2.292zm-11.007 0C11.19 15.66 10.999 13.03 10.993 13V5a1 1 0 00-1-1h-6c-1.103 0-2 .897-2 2v7a1 1 0 001 1h3.078a2.89 2.89 0 01-.429 1.396c-.508.801-1.465 1.348-2.846 1.624l-.803.16V20h1c2.783 0 4.906-.771 6.309-2.292z" />
            </svg>
          </button>
        </div>
        <div className="flex gap-6">
          <div className="relative" ref={colorRef}>
            <button
              type="button"
              onClick={() => {
                setShowColor(!showColor);
                setShowHeading(false);
                setShowFontType(false);
                setShowHightLight(false);
              }}
              className={`${
                editor.isActive('textStyle', { color: col }) ? 'is-active' : ''
              } w-6 h-6 flex items-center justify-center hover:text-blue-600`}
            >
              A
              <hr
                className="absolute -top-[13px] w-4 h-[3px]"
                style={{ background: col }}
              />
            </button>
            {showColor ? (
              <ColorPlate
                setColor={setColor}
                editor={editor}
                hideColorPopup={setShowColor}
                btnType="color"
              />
            ) : (
              <></>
            )}
          </div>
          <div className="relative" ref={highlightRef}>
            <button
              type="button"
              className="w-6 h-6 flex items-center justify-center hover:text-blue-600"
              onClick={() => {
                setShowHightLight(!showHighlight);
                setShowHeading(false);
                setShowFontType(false);
                setShowColor(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 -960 960 960"
              >
                <path d="M346-140 100-386q-10-10-15-22t-5-25q0-13 5-25t15-22l230-229-106-106 62-65 400 400q10 10 14.5 22t4.5 25q0 13-4.5 25T686-386L440-140q-10 10-22 15t-25 5q-13 0-25-5t-22-15Zm47-506L179-432h428L393-646Zm399 526q-36 0-61-25.5T706-208q0-27 13.5-51t30.5-47l42-54 44 54q16 23 30 47t14 51q0 37-26 62.5T792-120Z" />
              </svg>
              <hr
                className="absolute -top-[10px] w-4 h-[3px]"
                style={{ background: highlightColor }}
              />
            </button>
            {showHighlight ? (
              <ColorPlate
                setColor={setHighlightColor}
                hideColorPopup={setShowHightLight}
                editor={editor}
                btnType="highlight"
              />
            ) : (
              <></>
            )}
          </div>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${
              editor.isActive('bulletList') ? 'is-active text-blue-600' : ''
            } w-6 h-6 flex items-center justify-center hover:text-blue-600`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" height="18px" width="18px">
              <path d="M7 5h14v2H7V5m0 8v-2h14v2H7M4 4.5A1.5 1.5 0 015.5 6 1.5 1.5 0 014 7.5 1.5 1.5 0 012.5 6 1.5 1.5 0 014 4.5m0 6A1.5 1.5 0 015.5 12 1.5 1.5 0 014 13.5 1.5 1.5 0 012.5 12 1.5 1.5 0 014 10.5M7 19v-2h14v2H7m-3-2.5A1.5 1.5 0 015.5 18 1.5 1.5 0 014 19.5 1.5 1.5 0 012.5 18 1.5 1.5 0 014 16.5z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${
              editor.isActive('orderedList') ? 'is-active text-blue-600' : ''
            } w-6 h-6 flex items-center justify-center hover:text-blue-600`}
          >
            <svg fill="currentColor" viewBox="0 0 16 16" height="18px" width="18px">
              <path
                fillRule="evenodd"
                d="M5 11.5a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5z"
              />
              <path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 01-.492.594v.033a.615.615 0 01.569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 00-.342.338v.041zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635V5z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={` ${
              editor.isActive({ textAlign: 'left' }) ? 'is-active text-blue-600' : ''
            } w-6 h-6 flex items-center justify-center hover:text-blue-600`}
          >
            <svg fill="currentColor" viewBox="0 0 16 16" height="18px" width="18px">
              <path
                fillRule="evenodd"
                d="M2 12.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm0-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5zm0-3a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm0-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`${
              editor.isActive({ textAlign: 'center' })
                ? 'is-active text-blue-600'
                : ''
            } w-6 h-6 flex items-center justify-center hover:text-blue-600`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17px"
              height="17px"
              fill="currentColor"
              viewBox="0 -960 960 960"
            >
              <path d="M120-120v-80h720v80H120Zm160-160v-80h400v80H280ZM120-440v-80h720v80H120Zm160-160v-80h400v80H280ZM120-760v-80h720v80H120Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={` ${
              editor.isActive({ textAlign: 'right' })
                ? 'is-active text-blue-600'
                : ''
            }  w-6 h-6 flex items-center justify-center hover:text-blue-600`}
          >
            <svg fill="currentColor" viewBox="0 0 16 16" height="18px" width="18px">
              <path
                fillRule="evenodd"
                d="M6 12.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm-4-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5zm4-3a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm-4-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const extensions = [
  Color,
  Text,
  Highlight.configure({ multicolor: true }),
  TextStyle,
  TextAlign,
  Underline,
  CodeBlock,
  FontFamily,
  StarterKit,
  Typography,
  Blockquote,
  // HardBreak.extend({
  //   addKeyboardShortcuts () {
  //     return {
  //       Enter: () => this.editor.commands.setHardBreak()
  //     }
  //   }
  // }),
  OrderedList.configure({
    keepMarks: true,
    keepAttributes: false, // TODO : Making this as `false` because marks are not preserved when I try to preserve attrs, awaiting a bit of help
  }),
  ListItem,
  BulletList.configure({
    keepMarks: true,
    keepAttributes: false, // TODO : Making this as `false` because marks are not preserved when I try to preserve attrs, awaiting a bit of help
  }),
  Heading.configure({
    levels: [1, 2, 3],
  }),
  Mention.configure({
    HTMLAttributes: {
      class: 'mention',
    },

    suggestion,
  }),
  TextAlign.configure({
    defaultAlignment: '',
    types: ['heading', 'paragraph'],
  }),
];

const ProjectPipeLineEditor = ({ ...props }) => {
  const { t } = useTranslation();

  return (
    <div className="p-2">
      <EditorProvider
        onUpdate={(e) =>
          findMentionId(e.editor.getJSON(), props, e.editor.getHTML())
        }
        slotBefore={<MenuBar />}
        extensions={[
          ...extensions,
          Placeholder.configure({
            emptyNodeClass:
              'first:before:h-0 first:before:text-gray-400 first:before:float-left first:before:content-[attr(data-placeholder)] first:before:pointer-events-none',
            placeholder: `${t('CommentEditor.placeholder')}`,
          }),
        ]}
        {...props}
      />
    </div>
  );
};
export default ProjectPipeLineEditor;

function findMentionId(value: JSONContent, props: any, input: string) {
  if (!_.isEmpty(input)) {
    props.setFieldValue(props.name, input);
    const mentionArr: string[] = [];
    value?.content?.forEach((member: JSONContent) => {
      member?.content?.forEach((m) => {
        if (m.type === 'mention' && !mentionArr.includes(m.attrs?.id)) {
          mentionArr.push(m.attrs?.id);
        }
      });
    });
    let count = 0;
    const uniqueIds: (string | number)[] = [];
    props?.tagDropdown?.forEach((member: { display: string; id: number }) => {
      if (count < mentionArr?.length && member?.display === mentionArr[count]) {
        if (typeof member?.id === 'string') {
          const splitMemberId = (member.id as string).split(',').map(Number);
          uniqueIds.push(...splitMemberId);
          count = mentionArr?.length; // Exit loop early
        } else {
          count++;
          uniqueIds.push(member.id);
        }
      }
    });
    const uniqueIdSet = Array.from(new Set(uniqueIds));

    props.setFieldValue('mention_ids', uniqueIdSet);
  }
}

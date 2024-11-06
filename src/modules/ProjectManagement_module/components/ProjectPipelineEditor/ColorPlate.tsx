import { Editor } from '@tiptap/react';

function ColorPlate({
  setColor,
  editor,
  btnType,
  hideColorPopup,
}: {
  setColor(arg: string): void;
  editor: Editor;
  btnType: string;
  hideColorPopup(arg: boolean):void;
}) {
  function changeColor(color: string) {
    if (btnType === 'highlight') {
      editor.chain().focus().toggleHighlight({ color }).run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
    setColor(color);
    hideColorPopup(false);
  }
  return (
    <div className="list-none bg-white border rounded-sm absolute left-0 w-36 bottom-full p-2 grid grid-cols-7 gap-1">
      <span
        className="aspect-square hover:border"
        data-value="#000"
        onClick={() => changeColor('#000000')}
        style={{ backgroundColor: '#000000' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#e60000"
        onClick={() => changeColor('#E60000')}
        style={{ backgroundColor: '#E60000' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#ff9900"
        onClick={() => changeColor('rgb(255, 153, 0)')}
        style={{ backgroundColor: 'rgb(255, 153, 0)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#ffff00"
        onClick={() => changeColor('rgb(255, 255, 0)')}
        style={{ backgroundColor: 'rgb(255, 255, 0)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#008a00"
        onClick={() => changeColor('rgb(0, 138, 0)')}
        style={{ backgroundColor: 'rgb(0, 138, 0)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#0066cc"
        onClick={() => changeColor('rgb(0, 102, 204)')}
        style={{ backgroundColor: 'rgb(0, 102, 204)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#9933ff"
        onClick={() => changeColor('rgb(153, 51, 255)')}
        style={{ backgroundColor: 'rgb(153, 51, 255)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#ffffff"
        onClick={() => changeColor('rgb(255, 255, 255)')}
        style={{ backgroundColor: 'rgb(255, 255, 255)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#facccc"
        onClick={() => changeColor('rgb(250, 204, 204)')}
        style={{ backgroundColor: 'rgb(250, 204, 204)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#ffebcc"
        onClick={() => changeColor('rgb(255, 235, 204)')}
        style={{ backgroundColor: 'rgb(255, 235, 204)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#ffffcc"
        onClick={() => changeColor('rgb(255, 255, 204)')}
        style={{ backgroundColor: 'rgb(255, 255, 204)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#cce8cc"
        onClick={() => changeColor('rgb(204, 232, 204)')}
        style={{ backgroundColor: 'rgb(204, 232, 204)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#cce0f5"
        onClick={() => changeColor('rgb(204, 224, 245)')}
        style={{ backgroundColor: 'rgb(204, 224, 245)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#ebd6ff"
        onClick={() => changeColor('rgb(235, 214, 255)')}
        style={{ backgroundColor: 'rgb(235, 214, 255)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#bbbbbb"
        onClick={() => changeColor('rgb(187, 187, 187)')}
        style={{ backgroundColor: 'rgb(187, 187, 187)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#f06666"
        onClick={() => changeColor('rgb(240, 102, 102)')}
        style={{ backgroundColor: 'rgb(240, 102, 102)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#ffc266"
        onClick={() => changeColor('rgb(255, 194, 102)')}
        style={{ backgroundColor: 'rgb(255, 194, 102)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#ffff66"
        onClick={() => changeColor('rgb(255, 255, 102)')}
        style={{ backgroundColor: 'rgb(255, 255, 102)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#66b966"
        onClick={() => changeColor('rgb(102, 185, 102)')}
        style={{ backgroundColor: 'rgb(102, 185, 102)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#66a3e0"
        onClick={() => changeColor('rgb(102, 163, 224)')}
        style={{ backgroundColor: 'rgb(102, 163, 224)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#c285ff"
        onClick={() => changeColor('rgb(194, 133, 255)')}
        style={{ backgroundColor: 'rgb(194, 133, 255)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#888888"
        onClick={() => changeColor('rgb(136, 136, 136)')}
        style={{ backgroundColor: 'rgb(136, 136, 136)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#a10000"
        onClick={() => changeColor('rgb(161, 0, 0)')}
        style={{ backgroundColor: 'rgb(161, 0, 0)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#b26b00"
        onClick={() => changeColor('rgb(178, 107, 0)')}
        style={{ backgroundColor: 'rgb(178, 107, 0)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#b2b200"
        onClick={() => changeColor('rgb(178, 178, 0)')}
        style={{ backgroundColor: 'rgb(178, 178, 0)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#006100"
        onClick={() => changeColor('rgb(0, 97, 0)')}
        style={{ backgroundColor: 'rgb(0, 97, 0)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#0047b2"
        onClick={() => changeColor('rgb(0, 71, 178)')}
        style={{ backgroundColor: 'rgb(0, 71, 178)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#6b24b2"
        onClick={() => changeColor('rgb(107, 36, 178)')}
        style={{ backgroundColor: 'rgb(107, 36, 178)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#444444"
        onClick={() => changeColor('rgb(68, 68, 68)')}
        style={{ backgroundColor: 'rgb(68, 68, 68)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#5c0000"
        onClick={() => changeColor('rgb(92, 0, 0)')}
        style={{ backgroundColor: 'rgb(92, 0, 0)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#663d00"
        onClick={() => changeColor('rgb(102, 61, 0)')}
        style={{ backgroundColor: 'rgb(102, 61, 0)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#666600"
        onClick={() => changeColor('rgb(102, 102, 0)')}
        style={{ backgroundColor: 'rgb(102, 102, 0)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#003700"
        onClick={() => changeColor('rgb(0, 55, 0)')}
        style={{ backgroundColor: 'rgb(0, 55, 0)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#002966"
        onClick={() => changeColor('rgb(0, 41, 102)')}
        style={{ backgroundColor: 'rgb(0, 41, 102)' }}
      />
      <span
        className="aspect-square hover:border"
        data-value="#3d1466"
        onClick={() => changeColor('rgb(61, 20, 102)')}
        style={{ backgroundColor: 'rgb(61, 20, 102)' }}
      />
    </div>
  );
}

export default ColorPlate;

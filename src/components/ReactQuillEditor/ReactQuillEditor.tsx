import ErrorMessage from 'components/FormElement/ErrorMessage';
import Image from 'components/Image';
import { useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './style/style.css';

type Editor = {
  imageField?: string;
  name: string;
  value: string;
  parentClass?: string;
  setFieldValue?: (field: string, value: string, shouldValidate?: boolean) => void;
  setFieldTouched?: (
    field: string,
    isTouched?: boolean | undefined,
    shouldValidate?: boolean | undefined
  ) => void;
  label?: string;
  labelClass?: string;
  isCompulsory?: boolean;
  disabled?: boolean;
  placeholder?: string;
  styles?: Object;
  // tagDropdown?: MembersProps[];
  onChange?: (content: string) => void;
  isLoading?: boolean;
};

const ReactEditor = ({
  imageField,
  value,
  name,
  parentClass,
  setFieldValue,
  setFieldTouched,
  label,
  labelClass,
  isCompulsory,
  disabled,
  placeholder,
  styles,
  onChange,
  // tagDropdown,
  isLoading = false,
}: Editor) => {
  const quillObj = useRef<ReactQuill | null>(null);

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3] }],
        [{ font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'blockquote'],
        [{ color: [] }, { background: [] }],
        [
          { list: 'ordered' },
          { list: 'bullet' },
          { indent: '-1' },
          { indent: '+1' },
        ],
        imageField ? ['link', 'image'] : [],
        ['clean'],
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'color',
    'background',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
  ];

  const handleContentChange = (
    _content: any,
    _delta: any,
    _source: any,
    editor: any
  ) => {
    if (setFieldValue && editor) {
      const newContent = editor.getHTML();
      setFieldValue(name, newContent);
    }

    if (onChange) {
      const newContent = editor.getHTML();
      onChange(newContent);
    }
  };
  // const [tag, setTag] = useState<MembersProps[] | undefined>([]);
  // useEffect(() => {
  //   setTag(tagDropdown)
  // }, [tagDropdown])
  return (
    <div className={`w-full ${parentClass ?? ''}`}>
      {label && (
        <label
          className={`text-sm text-black leading-4 inline-block mb-2 ${
            labelClass ?? ''
          }`}
          htmlFor={name}
        >
          {label}
          {isCompulsory && <span className="text-red-700">*</span>}
        </label>
      )}
      <ReactQuill
        className="notranslate"
        ref={(el) => {
          quillObj.current = el;
        }}
        theme="snow"
        value={value || undefined}
        onChange={handleContentChange}
        formats={formats}
        modules={modules}
        style={{ width: '100%', border: '1px solid #000', ...styles }}
        onBlur={() => {
          setFieldTouched?.(name, true, true);
        }}
        readOnly={disabled}
        placeholder={placeholder}
      />
      {isLoading ? (
        <div className="relative ">
          <Image loaderClassName="absolute right-3 bottom-2" loaderType="Spin" />
        </div>
      ) : (
        ''
      )}
      <ErrorMessage name={name} />
    </div>
  );
};

export default ReactEditor;

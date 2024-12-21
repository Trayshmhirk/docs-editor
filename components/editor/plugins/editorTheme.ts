import { EditorThemeClasses } from "lexical";

export const editorTheme: EditorThemeClasses = {
  ltr: "ltr",
  rtl: "rtl",
  paragraph: "editor-paragraph",
  quote: "editor-quote",
  placeholder: "editor-placeholder",
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2",
    h3: "editor-heading-h3",
    h4: "editor-heading-h4",
    h5: "editor-heading-h5",
  },
  list: {
    nested: {
      listitem: "editor-nested-listitem",
    },
    ol: "editor-list-ol",
    olDepth: [
      "editor-list-ol1",
      "editor-list-ol2",
      "editor-list-ol3",
      "editor-list-ol4",
      "editor-list-ol5",
    ],
    ul: "editor-list-ul",
    listitem: "editor-listItem",
    checklist: "editor-checklist",
    listitemChecked: "editor-listItemChecked",
    listitemUnchecked: "editor-listItemUnchecked",
  },
  image: "editor-image",
  link: "editor-link",
  text: {
    bold: "editor-textBold",
    code: "editor-textCode",
    italic: "editor-textItalic",
    strikethrough: "editor-textStrikethrough",
    hashtag: "editor-textHashtag",
    overflowed: "editor-textOverflowed",
    underline: "editor-textUnderline",
    underlineStrikethrough: "editor-textUnderlineStrikethrough",
  },
  code: "editor-code",
  codeHighlight: {
    atrule: "editor-tokenAttr",
    attr: "editor-tokenAttr",
    boolean: "editor-tokenProperty",
    builtin: "editor-tokenSelector",
    cdata: "editor-tokenComment",
    char: "editor-tokenSelector",
    class: "editor-tokenFunction",
    "class-name": "editor-tokenFunction",
    comment: "editor-tokenComment",
    constant: "editor-tokenProperty",
    deleted: "editor-tokenProperty",
    doctype: "editor-tokenComment",
    entity: "editor-tokenOperator",
    function: "editor-tokenFunction",
    important: "editor-tokenVariable",
    inserted: "editor-tokenSelector",
    keyword: "editor-tokenAttr",
    namespace: "editor-tokenVariable",
    number: "editor-tokenProperty",
    operator: "editor-tokenOperator",
    prolog: "editor-tokenComment",
    property: "editor-tokenProperty",
    punctuation: "editor-tokenPunctuation",
    regex: "editor-tokenVariable",
    selector: "editor-tokenSelector",
    string: "editor-tokenSelector",
    symbol: "editor-tokenProperty",
    tag: "editor-tokenProperty",
    url: "editor-tokenOperator",
    variable: "editor-tokenVariable",
  },
};

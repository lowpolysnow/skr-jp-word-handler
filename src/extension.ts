'use strict';

import * as vscode from 'vscode';
import { Position, Range, Selection, TextDocument, TextEditor } from 'vscode';

//-----------------------------------------------------------------------------

const enum CharCode {
  Null = 0,
  /**
   * The `\b` character.
   */
  Backspace = 8,
  /**
   * The `\t` character.
   */
  Tab = 9,
  /**
   * The `\n` character.
   */
  LineFeed = 10,
  /**
   * The `\r` character.
   */
  CarriageReturn = 13,
  /**
   * The `!` character.
   */
  ExclamationMark = 33,
  /**
   * The `"` character.
   */
  DoubleQuote = 34,
  /**
   * The `#` character.
   */
  Hash = 35,
  /**
   * The `$` character.
   */
  DollarSign = 36,
  /**
   * The `%` character.
   */
  PercentSign = 37,
  /**
   * The `&` character.
   */
  Ampersand = 38,
  /**
   * The `'` character.
   */
  SingleQuote = 39,
  /**
   * The `(` character.
   */
  OpenParen = 40,
  /**
   * The `)` character.
   */
  CloseParen = 41,
  /**
   * The `*` character.
   */
  Asterisk = 42,
  /**
   * The `+` character.
   */
  Plus = 43,
  /**
   * The `,` character.
   */
  Comma = 44,
  /**
   * The `-` character.
   */
  Dash = 45,
  /**
   * The `.` character.
   */
  Period = 46,
  /**
   * The `/` character.
   */
  Slash = 47,

  Digit0 = 48,
  Digit1 = 49,
  Digit2 = 50,
  Digit3 = 51,
  Digit4 = 52,
  Digit5 = 53,
  Digit6 = 54,
  Digit7 = 55,
  Digit8 = 56,
  Digit9 = 57,

  /**
   * The `:` character.
   */
  Colon = 58,
  /**
   * The `;` character.
   */
  Semicolon = 59,
  /**
   * The `<` character.
   */
  LessThan = 60,
  /**
   * The `=` character.
   */
  Equals = 61,
  /**
   * The `>` character.
   */
  GreaterThan = 62,
  /**
   * The `?` character.
   */
  QuestionMark = 63,
  /**
   * The `@` character.
   */
  AtSign = 64,

  A = 65,
  B = 66,
  C = 67,
  D = 68,
  E = 69,
  F = 70,
  G = 71,
  H = 72,
  I = 73,
  J = 74,
  K = 75,
  L = 76,
  M = 77,
  N = 78,
  O = 79,
  P = 80,
  Q = 81,
  R = 82,
  S = 83,
  T = 84,
  U = 85,
  V = 86,
  W = 87,
  X = 88,
  Y = 89,
  Z = 90,

  /**
   * The `[` character.
   */
  OpenSquareBracket = 91,
  /**
   * The `\` character.
   */
  Backslash = 92,
  /**
   * The `]` character.
   */
  CloseSquareBracket = 93,
  /**
   * The `^` character.
   */
  Caret = 94,
  /**
   * The `_` character.
   */
  Underline = 95,
  /**
   * The ``(`)`` character.
   */
  BackTick = 96,

  a = 97,
  b = 98,
  c = 99,
  d = 100,
  e = 101,
  f = 102,
  g = 103,
  h = 104,
  i = 105,
  j = 106,
  k = 107,
  l = 108,
  m = 109,
  n = 110,
  o = 111,
  p = 112,
  q = 113,
  r = 114,
  s = 115,
  t = 116,
  u = 117,
  v = 118,
  w = 119,
  x = 120,
  y = 121,
  z = 122,

  /**
   * The `{` character.
   */
  OpenCurlyBrace = 123,
  /**
   * The `|` character.
   */
  Pipe = 124,
  /**
   * The `}` character.
   */
  CloseCurlyBrace = 125,
  /**
   * The `~` character.
   */
  Tilde = 126,
  /**
   * The DEL control code.
   */
  DEL = 127,

  /**
   * 半角スペース
   */
  Space = 0x20,

  /**
   * 全角スペース
   */
  F_Space = 0x3000,

  /**
   * 日本語 読点"、"Ideographic Comma
   */
  IdeographicComma = 0x3001,

  /**
   * 日本語 句読点" "Ideographic Half Fill Space
   */
  IdeographicHalfFillSpace = 0x303F,

  /**
   * 日本語 繰返し記号"々" Ideographic Iteration Mark
   */
  IdeographicIterationMark = 0x3005,

  /**
   * 日本語 中黒点"・" Katakana Middle Dot
   */
  KatakanaMiddleDot = 0x30FB,

  /**
   * 日本語 "！"
   */
  F_ExclamationMark = 0xff01,

    /**
   * 日本語 "／"
   */
  F_Slash = 0xff0f,

  /**
   * 日本語 "："
   */
  F_Colon = 0xff1a,

    /**
   * 日本語 "＠"
   */
  F_AtSign = 0xff20,

  /**
   * 日本語 "［"
   */
  F_OpenSquareBracket = 0xff3b,

  /**
   * 日本語 "｀"
   */
  F_BackTick = 0xff40,

  /**
   * 日本語 "｛"
   */
  F_OpenCurlyBrace = 0xff5b,
  
  /**
   * 日本語 半角カナ中黒"・"  Halfwidth Katakana Middle Dot
   */
  F_HalfwidthKatakanaMiddleDot = 0xff65,

  /**
   * "￠"
   */
  F_Cent = 0xffe0,

  /**
   * HALFWIDTH WHITE CIRCLE
   */
  F_HalfwidthWhiteCircle = 0xffee,

  /**
   * 日本語 カタカナ "ァ"
   */
  F_Ka = 0x30a1,

  /**
   * 日本語 カタカナ "ヿ"
   */
  F_Kz = 0x30ff,

  /**
   * 日本語 カタカナ "ぁ"
   */
  F_Ha = 0x3041,

  /**
   * 日本語 カタカナ "ゟ"
   */
  F_Hz = 0x309f,

  /**
   * 日本語 半角カタカナ "ｧ"
   */
  Ka = 0xff66,

  /**
   * 日本語 半角カタカナ "ﾝ"
   */
  Kz = 0xff9d,


  /**
   * 水平タブ
   */
  HT = 0x09,

  /**
   * fullwidth digit 0
   */
  F_Digit0 = 0xff10,

  /**
   * fullwidth digit 9
   */
  F_Digit9 = 0xff19,

  /**
   * fullwidth alphabet, uppercase A
   */
  F_A = 0xff21,

  /**
   * fullwidth alphabet, uppercase Z
   */
  F_Z = 0xff3a,

  /**
   * fullwidth alphabet, uppercase a
   */
  F_a = 0xff41,

  /**
   * fullwidth alphabet, uppercase z
   */
  F_z = 0xff5a,

  /**
   * latin character(start)
   */
  LC_start = 0xc0,

  /**
   * latin character(end)
   */
  LC_end = 0xff,

  /**
   * latin character(multiplication sign)
   */
  LC_multi = 0xd7,

  /**
   * latin character(division sign)
   */
  LC_div = 0xf7,

  /**
   * fullwidth underscore
   */
  F_underline = 0xff3f,


  U_Combining_Grave_Accent = 0x0300,                //  U+0300  Combining Grave Accent
  U_Combining_Acute_Accent = 0x0301,                //  U+0301  Combining Acute Accent
  U_Combining_Circumflex_Accent = 0x0302,              //  U+0302  Combining Circumflex Accent
  U_Combining_Tilde = 0x0303,                    //  U+0303  Combining Tilde
  U_Combining_Macron = 0x0304,                  //  U+0304  Combining Macron
  U_Combining_Overline = 0x0305,                  //  U+0305  Combining Overline
  U_Combining_Breve = 0x0306
}
export function activate(context: vscode.ExtensionContext) {
  function registerCommand(name: string, logic: Function) {
    let command = vscode.commands.registerCommand(
      name,
      () => {
        let editor = vscode.window.activeTextEditor!;
        let wordSeparators = vscode.workspace
          .getConfiguration("editor", editor.document.uri)
          .get("wordSeparators");
        logic(editor, wordSeparators);
      });
    context.subscriptions.push(command);
  }

  // Register commands
  registerCommand('skrJpWordHandler.moveWordPartLeft', moveWordPartLeft);
  registerCommand('skrJpWordHandler.moveWordPartRight', moveWordPartRight);

  registerCommand('skrJpWordHandler.moveWordPartLeftSelect', moveWordPartLeftSelect);
  registerCommand('skrJpWordHandler.moveWordPartRightSelect', moveWordPartRightSelect);

  registerCommand('skrJpWordHandler.deleteWordPartLeft', deleteWordPartLeft);
  registerCommand('skrJpWordHandler.deleteWordPartRight', deleteWordPartRight);

}

//-----------------------------------------------------------------------------
function _move(
  editor: TextEditor,
  wordSeparators: string,
  find: Function
) {
  const document = editor.document;
  editor.selections = editor.selections
    .map(s => find(document, s.active, wordSeparators))
    .map(p => new Selection(p, p));
  if (editor.selections.length === 1) {
    editor.revealRange(editor.selection);
  }
}

function _select(
  editor: TextEditor,
  wordSeparators: string,
  find: Function
) {
  editor.selections = editor.selections
    .map(s => new Selection(
      s.anchor,
      find(editor.document, s.active, wordSeparators))
    );
  if (editor.selections.length === 1) {
    editor.revealRange(editor.selection);
  }
}

function _delete(
  editor: TextEditor,
  wordSeparators: string,
  find: Function
) {
  return editor.edit(e => {
    const document = editor.document;
    let selections = editor.selections.map(
      s => new Selection(
        s.anchor,
        find(document, s.active, wordSeparators)
      ));
    for (let selection of selections) {
      e.delete(selection);
    }
  }).then(() => {
    if (editor.selections.length === 1) {
      editor.revealRange(editor.selection);
    }
  });
}

export function moveWordPartLeft(editor: TextEditor, wordSeparators: string) {
  _move(editor, wordSeparators, _moveWordPartLeft);
}
export function moveWordPartRight(editor: TextEditor, wordSeparators: string) {
  _move(editor, wordSeparators, _moveWordPartRight);
}

export function moveWordPartLeftSelect(editor: TextEditor, wordSeparators: string) {
  _select(editor, wordSeparators, _moveWordPartLeft);
}
export function moveWordPartRightSelect(editor: TextEditor, wordSeparators: string) {
  _select(editor, wordSeparators, _moveWordPartRight);
}

export function deleteWordPartLeft(editor: TextEditor, wordSeparators: string) {
  return _delete(editor, wordSeparators, _moveWordPartLeft);
}
export function deleteWordPartRight(editor: TextEditor, wordSeparators: string) {
  return _delete(editor, wordSeparators, _moveWordPartRight);
}

//-----------------------------------------------------------------------------
enum CharClass {
  SpaceHalf,    // w:半角スペース
  SpaceFull,    // W:全角スペース
  UpperAlHalf,  // A:半角英大文字
  LowerAlHalf,  // a:半角英小文字
  UpperAlFull,  // B:全角英大文字
  LowerAlFull,  // b:全角英小文字
  NumHalf,      // 8:半角数字
  NumFull,      // 9:全角数字
  UnderHalf,    // u:半角アンダーバー
  UnderFull,    // U:全角アンダーバー
  Latin,        // L:ラテン文字
  Punctuation,  // N:句読点・記号
  Hiragana,     // H:ひらがな
  KatakanaHalf, // k:半角カタカナ
  KatakanaFull, // K:全角カタカナ
  Other,        // J:漢字
  Separator,    // p:句切文字
  Invalid,      // i:無効
  HT,           // h:水平タブ
}


/******************************************************** */

// 【ユニバーサル言語定義】
//
// 単語区切り："Part"など、単語になる文字
// 種区切り文字：文字種の切り替わりをキッカケになる文字
// 種区切りコード：文字種の切り替わりをキッカケになる文字
// vscode区切り文字：editor.wordSeparatorsに設定されている区切り文字。
//

/***
 * 3文字分の検出器
 */
class Detector {
  /**
  * 左側の文字種
  */
  leftClass: CharClass;

  /**
  * 中央の文字種
  */
  middleClass: CharClass;

  /**
  * 右側の文字種
  */
  rightClass: CharClass;

  /**
   * 検出を開始するカーソル位置。
   * 初回検索時では、center=middleになる。
   */
  centerLine: number;
  /**
   * 検出を開始するカーソル位置。
   * 初回検索時では、center=middleになる。
   */
  centerColumn: number;

  /**
   * 種区切りコードを取得するメソッド
   */
  private caretClassify : (doc: TextDocument, line: number, character: number)=>CharClass ;

  private doc:TextDocument;

  /**
  * コンストラクタ
  * @param doc 現在のエディタ内のテキスト情報
  * @param centerPos 検出を開始するカーソル位置。初回検索時では、center=middleになる。
  * @param String vscode設定区切り文字
  */
  constructor(
    doc: TextDocument,
    centerPos: Position,
    wordSeparators: string) {
    //CharClassを取得する。

    //CharClass.Invalidも含む
    this.doc = doc;
    this.centerLine = centerPos.line;
    this.centerColumn = centerPos.character;
    this.caretClassify = makeClassifier(wordSeparators);
    this.leftClass = CharClass.Invalid;
    this.middleClass = CharClass.Invalid;
    this.rightClass = CharClass.Invalid;
    this.redetectClass();
  }

  /**
   * centerColumnを基準にして、検出器の範囲を設定する。
   */
  private redetectClass(){
    this.leftClass = this.caretClassify(this.doc, this.centerLine, this.centerColumn-1);
    this.middleClass = this.caretClassify(this.doc, this.centerLine, this.centerColumn);
    this.rightClass = this.caretClassify(this.doc, this.centerLine, this.centerColumn+1);
  }

  /**
   * 検出範囲を左にスライドする
   * @param num スライドする文字数
   * @returns true:スライドが成功, false:スライドした結果、検出器が行をはみ出るとき(スライド処理は行われません)
   */
  slideToLeft(num:number):boolean{
    let result:boolean = true;
    
    if( this.centerColumn - num <= 0 ){
      result=false;
    }else{
      this.centerColumn = this.centerColumn - num;
      this.redetectClass();
    }
    return result;
  }
    
  /**
   * 検出範囲を右にスライドする
   * @param num スライドする文字数
   * @returns true:スライドが成功, false:スライドした結果、検出器が行をはみ出るとき(スライド処理は行われません)
   */
  slideToRight(num:number):boolean{
    let result:boolean = true;
    
    if( this.caretClassify(this.doc, this.centerLine, this.centerColumn + num ) === CharClass.Invalid) {
      result=false;
    }else{
      this.centerColumn = this.centerColumn + num;
      this.redetectClass();
    }

    return result;
  }
}

/**
 * 左側を種区切り文字検索＆単語区切り検索
 * @param doc
 * @param caretPos
 * @param wordSeparators
 */
function _moveWordPartLeft(
  doc: TextDocument,
  caretPos: Position,
  wordSeparators: string,
  ): Position | undefined {

  const caretLine = caretPos.line;
  const caretColumn = caretPos.character;

  //すでに端にいるときは前の行へ
  if (caretColumn === 0) {
    return (caretLine > 0 ? doc.positionAt(doc.offsetAt(caretPos)-1) : caretPos);
  }

  //端＋１にいるときは、問答無用で端へ。
  if (caretColumn === 1) {
    return (doc.positionAt(doc.offsetAt(caretPos)-1));
  }

  let detector:Detector = new Detector(doc,doc.positionAt(doc.offsetAt(caretPos)-2),wordSeparators);

  if(detector.leftClass === CharClass.Invalid){
    //検出器の左側が無効のときの処理。
    if(detector.middleClass === detector.rightClass){
      return new Position(detector.centerLine, detector.centerColumn);
    }else{
      if(detector.middleClass === CharClass.UpperAlHalf && detector.rightClass === CharClass.LowerAlHalf){
        //単語区切り
        return new Position(detector.centerLine, detector.centerColumn);
      }else{
        //それ以外の文字種
        return new Position(detector.centerLine, detector.centerColumn+1);
      }
    }
  }else{
    //ここから繰り返しの処理。
    //検出器の真ん中と右側を比較して、大文字・小文字の組み合わせなら、左側も確認。
    //それ以外は、右側に移動。
    do{
      if(detector.middleClass === CharClass.UpperAlHalf && detector.rightClass === CharClass.LowerAlHalf){
        if(detector.leftClass === CharClass.LowerAlHalf){
          //単語区切り
          return new Position(detector.centerLine, detector.centerColumn);
        }else if(detector.leftClass === CharClass.UpperAlHalf){
          //大文字の連なり
          return new Position(detector.centerLine, detector.centerColumn+1);
        }else{
          //左側がそれ以外の文字＝単語区切りとする。
          return new Position(detector.centerLine, detector.centerColumn);
        }
      }else{
        if(detector.middleClass === detector.rightClass){
          if(detector.leftClass === detector.middleClass){
            //3文字とも同じなので、
            //検出器を左にずらして繰り返し。
            let slide_result:boolean = detector.slideToLeft(1);
            if(!slide_result){
              //slideに失敗時はすでに左端なので、左端を返せばいい
              return new Position(detector.centerLine, detector.centerColumn-1);
            }
          }else{
            if(detector.leftClass === CharClass.UpperAlHalf && detector.middleClass === CharClass.LowerAlHalf){
              //左側大文字、真ん中小文字の組み合わせなら、単語か大文字の連なり＋小文字の可能性があるため、
              //検出器を左にずらして繰り返し。
              let slide_result:boolean = detector.slideToLeft(1);
              if(!slide_result){
                //slideに失敗時は、すでに左端なので、単語区切りとして、左端を返せばいい
                return new Position(detector.centerLine,detector.centerColumn-1);
              }
            }else{
              //普通の種区切り
              return new Position(detector.centerLine,detector.centerColumn);
            }
          }
        }else{
          //真ん中と右側が普通に異なる場合
          return new Position(detector.centerLine,detector.centerColumn+1);
        }
      }
      
    //@ts-ignore
    }while(detector.leftClass !== CharClass.Invalid);
  }
}


/**
 * 右側を種区切り文字検索＆単語区切り検索
 * @param doc
 * @param caretPos
 * @param wordSeparators
 */
function _moveWordPartRight(
  doc: TextDocument,
  caretPos: Position,
  wordSeparators: string,
  ): Position | undefined {

  const caretLine = caretPos.line;
  const caretColumn = caretPos.character;
  const classify:(doc: TextDocument, line: number,character: number)=>CharClass = makeClassifier(wordSeparators);

  //すでに端にいるときは次の行へ
  if (classify(doc,caretLine,caretColumn) === CharClass.Invalid) {
    const nextLine = caretLine + 1 ;
    return (( nextLine< doc.lineCount) ? new Position( nextLine, 0 ) : caretPos);
  }

  let detector:Detector = new Detector(doc,doc.positionAt(doc.offsetAt(caretPos)+1),wordSeparators);

  //端－１にいるときは、問答無用で端へ。
  if (detector.middleClass === CharClass.Invalid) {
    return (doc.positionAt(doc.offsetAt(caretPos)+1));
  }

  if(detector.rightClass === CharClass.Invalid){
    //検出器の右側が無効のときの処理。
    if( detector.leftClass === detector.middleClass){
      return new Position(detector.centerLine, detector.centerColumn+1);
    }else{
      let slide_result = detector.slideToLeft(1);
      if(slide_result){
        if(detector.leftClass !== CharClass.UpperAlHalf){
          //左側が大文字以外のときは、単語区切りとする。
          //単語区切り
          //右がInvalidになるため検出器がもう戻せないのでこのまま検証
          if(detector.middleClass === CharClass.UpperAlHalf
              //@ts-ignore
              &&detector.rightClass === CharClass.LowerAlHalf ){
              //単語区切りモードが右端まで続くので、右端を返せばいい
              return new Position(detector.centerLine, detector.centerColumn+2);
            }else{
              //普通の文字種違いになるので、＋１右を返せばいい
              return new Position(detector.centerLine, detector.centerColumn+1);
            }
        }else{
          //大文字の連なり
          return new Position(detector.centerLine, detector.centerColumn+1);
        }
      }else{
        if(detector.leftClass === CharClass.UpperAlHalf && detector.middleClass === CharClass.LowerAlHalf){
          //スライド失敗かつこの条件のときは、|Abなので、普通の単語区切り
          //単語区切り
          return new Position(detector.centerLine, detector.centerColumn+1);
        }else{
          //スライド失敗かつこの条件のときは、|AXなので、普通の文字種区切り
          //それ以外の文字種
          return new Position(detector.centerLine, detector.centerColumn);
        }
      }
    }
  }else{
    //ここから繰り返しの処理。
    //検出器の真ん中と左側を比較して、大文字・小文字の組み合わせなら、右側も確認。
    //それ以外は、左側に移動。
    
    do{
      if( detector.leftClass === CharClass.LowerAlHalf && detector.middleClass === CharClass.UpperAlHalf ){
        //単語区切り
        return new Position(detector.centerLine, detector.centerColumn);

      }else{
        if( detector.leftClass === detector.middleClass){
          if( detector.middleClass === detector.rightClass ){
            //3文字とも同じなので、
            //検出器を右にずらして繰り返し。
            let slide_result:boolean = detector.slideToRight(1);
            if(!slide_result){
              //slideに失敗時はすでに右端なので、右端を返せばいい
              return new Position(detector.centerLine, detector.centerColumn+1);
            }
          }else{
            //普通の種区切り
            return new Position(detector.centerLine,detector.centerColumn+1);
          }
        }else{
          if(!((detector.leftClass === CharClass.UpperAlHalf || detector.leftClass === CharClass.LowerAlHalf)
          && (detector.middleClass === CharClass.UpperAlHalf || detector.middleClass === CharClass.LowerAlHalf))){
            //真ん中と左側が普通に異なる場合
            return new Position(detector.centerLine,detector.centerColumn);
          }else if(!((detector.rightClass === CharClass.UpperAlHalf || detector.rightClass === CharClass.LowerAlHalf)
          && (detector.middleClass === CharClass.UpperAlHalf || detector.middleClass === CharClass.LowerAlHalf))){
            //真ん中と右側が普通に異なる場合
            //@ts-ignore
            if(detector.middleClass === detector.rightClass){
              //真ん中と右側が同じ場合
              detector.slideToRight(1);
            }else{
              //真ん中と右側が普通に異なる場合
              return new Position(detector.centerLine,detector.centerColumn+1);
            }
          }else{
            let slide_result = detector.slideToLeft(1);
            if(slide_result){
              //@ts-ignore
              if(detector.leftClass !== CharClass.UpperAlHalf){
                //左側が大文字以外のときは、単語区切りとする。
                //単語区切り
                //先のslideToLeftを元に戻してから、次の繰り返しへ
                detector.slideToRight(1);
                if(detector.middleClass === detector.rightClass){
                  let slide_result = detector.slideToRight(1);
                  if( slide_result ){
                    continue;
                  }else{
                    //slideに失敗時は同じ文字種が右端まで続くので、右端を返せばいい
                    return new Position(detector.centerLine, detector.centerColumn+1);
                  }
                }else{
                  if(detector.middleClass === CharClass.UpperAlHalf
                    &&detector.rightClass === CharClass.LowerAlHalf){
                    let slide_result = detector.slideToRight(1);
                    if(slide_result){
                      continue;
                    }else{
                      //slideに失敗時は単語区切りモードが右端まで続くので、右端を返せばいい
                      return new Position(detector.centerLine, detector.centerColumn+1);
                    }
                  }else{
                    //普通の文字種違いになるので、＋１右を返せばいい
                    return new Position(detector.centerLine, detector.centerColumn+1);
                  }
                }
              }else{
                //大文字の連なり
                return new Position(detector.centerLine, detector.centerColumn+1);
              }
            }else{
              //スライド失敗時は、|Abcdなので、普通の普通の単語区切り
              //検出器を右にずらして繰り返し
              detector.slideToRight(1);
              continue;
            }
          }
        }
      }
      
    //@ts-ignore
    }while(detector.leftClass !== CharClass.Invalid);
  }
}

/**
 * Compose a character classifier function.
 * @param wordSeparators A string containing characters to separate words
 *                       (mostly used in English-like language context.)
 */
function makeClassifier(wordSeparators: string):( doc: TextDocument,
  line: number,
  character: number)=>CharClass {
  return function classifyChar(
    doc: TextDocument,
    line: number,
    column: number
  ) {
    if (line < 0 || column < 0) {
      return CharClass.Invalid;
    }

    const range = new Range(
      line, column,
      line, column + 1
    );
    const text = doc.getText(range);
    if (text.length === 0) {
      return CharClass.Invalid;  // end-of-line or end-of-document
    }
    const ch = text.charCodeAt(0);

    ///【TODO】wordSeparatorsの記号は、ひとまとめにされてしまうので、
    ///【TODO】wordSeparatorsに頼らない記号の文字種分割が必要。

    ///【TODO】設定した記号は、文字種区切りとは見なさない機能がほしい。

    if (wordSeparators.indexOf(text) !== -1) {
      return CharClass.Separator;
    }

    if (ch === CharCode.HT ) {
      return CharClass.HT;
    }
    
    if ( ch === CharCode.Space ) {
      return CharClass.SpaceHalf;
    }

    if(ch === CharCode.F_Space){
      return CharClass.SpaceFull;
    }

    if (CharCode.Digit0 <= ch && ch <= CharCode.Digit9){ return CharClass.NumHalf; }      // halfwidth digit
    if (CharCode.F_Digit0 <= ch && ch <= CharCode.F_Digit9){ return CharClass.NumFull; }   // fullwidth digit
    if (CharCode.A <= ch && ch <= CharCode.Z){ return CharClass.UpperAlHalf; }       // halfwidth alphabet, upper case
    if (ch === CharCode.Underline ){ return CharClass.UnderHalf; }                      // underscore
    if (CharCode.a <= ch && ch <= CharCode.z){ return CharClass.LowerAlHalf; }       // halfwidth alphabet, lower case
    if (CharCode.LC_start <= ch && ch <= CharCode.LC_end        // latin character
      && ch !== CharCode.LC_multi && ch !== CharCode.LC_div ){ return CharClass.Latin; }  // (excluding multiplication/division sign)
    if (CharCode.F_A <= ch && ch <= CharCode.F_Z){ return CharClass.UpperAlFull; }   // fullwidth alphabet, upper case
    if (ch === CharCode.F_underline ){return CharClass.UnderFull; }                    // fullwidth underscore
    if (CharCode.F_a <= ch && ch <= CharCode.F_z){ return CharClass.LowerAlFull; } // fullwidth alphabet, lower case

    if ((CharCode.ExclamationMark <= ch && ch <= CharCode.Slash)
      || (CharCode.Colon <= ch && ch <= CharCode.AtSign)
      || (CharCode.OpenSquareBracket <= ch && ch <= CharCode.BackTick)
      || (CharCode.OpenCurlyBrace <= ch && ch <= CharCode.DEL)
      || (CharCode.IdeographicComma <= ch && ch <= CharCode.IdeographicHalfFillSpace && ch !== CharCode.IdeographicIterationMark) // CJK punctuation marks except Ideographic iteration mark
      || ch === CharCode.KatakanaMiddleDot    // 全角カタカナ　中黒点
      || (CharCode.F_ExclamationMark <= ch && ch <= CharCode.F_Slash)   // "Full width" forms (1)
      || (CharCode.F_Colon <= ch && ch <= CharCode.F_AtSign)   // "Full width" forms (2)
      || (CharCode.F_OpenSquareBracket <= ch && ch <= CharCode.F_BackTick)   // "Full width" forms (3)
      || (CharCode.F_OpenCurlyBrace <= ch && ch <= CharCode.F_HalfwidthKatakanaMiddleDot)   // "Full width" forms (4)
      || (CharCode.F_Cent <= ch && ch <= CharCode.F_HalfwidthWhiteCircle)) {// "Full width" forms (5)
      return CharClass.Punctuation;
    }

    if ((CharCode.F_Ka <= ch && ch <= CharCode.F_Kz)   // 全角カタカナ
      && ch !== CharCode.KatakanaMiddleDot) {          // excluding 全角カタカナ 中黒点
      return CharClass.KatakanaFull;
    }

    if (CharCode.F_Ha <= ch && ch <= CharCode.F_Hz) {  // ひらがな
      return CharClass.Hiragana;
    }

    if (CharCode.Ka <= ch && ch <= CharCode.Kz) {     // 半角カタカナ
      return CharClass.KatakanaHalf;
    }

    return CharClass.Other;
  };
}



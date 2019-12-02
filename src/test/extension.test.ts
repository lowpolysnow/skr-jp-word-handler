// Note: This test is leveraging the Mocha test framework (https://mochajs.org/)

import * as assert from 'assert';
import * as vscode from 'vscode';
import { Position, Range, Selection, TextEditor, TextEditorEdit, EndOfLine } from 'vscode';

import * as myExtension from '../extension';


describe("skr-jp-word-handler", () => {
    // Prepare utility functions and constants
    const setText = async function (editor: TextEditor, text: string) {
        return editor.edit((editBuilder: TextEditorEdit) => {
            const doc = editor.document;
            const startPos = new Position(0, 0);
            const lastLine = doc.lineAt(doc.lineCount - 1);
            const endPos = lastLine.range.end;
            const entireRange = new Range(startPos, endPos);
            editBuilder.replace(entireRange, text);
            editBuilder.setEndOfLine(EndOfLine.LF);
        });
    };

    beforeEach(async () => {
        const uri = vscode.Uri.parse("untitled:test.txt");
        await vscode.window.showTextDocument(uri);
    });

    afterEach(async () => {
        const commandName = "workbench.action.closeAllEditors";
        await vscode.commands.executeCommand(commandName);
    });



    /**
     * 単数行のテストデータ(moveLeft,selectLeft)
     */
    // pattern:パターン概要
    // name:文字タイプによるパターン説明(CharClass参照)、input:実文字列
    // start:開始カーソル位置、expected:コマンド実行後のカーソル位置
    //
    // カーソル位置例・・・"|aa"=0,"a|a"=1　。startとexpectedの位置は0相対。
    const cursolMoveTestDataToLeft = [
        { pattern: "a",     name: "iai",  input: "a",     start:0,   expected:0, },//これは１行しか無いとき、そこにとどまる。

        { pattern: "aa",    name: "iaai", input: "aa",    start:1,   expected:0, },
        { pattern: "Aa",    name: "iAai", input: "Aa",    start:1,   expected:0, },
        { pattern: "aA",    name: "iaAi", input: "aA",    start:1,   expected:0, },
        { pattern: "AA",    name: "iAAi", input: "AA",    start:1,   expected:0, },

        { pattern: "Xaa",    name: "iwaai", input: " aa",    start:2,   expected:1, },
        { pattern: "Aaa",    name: "iAaai", input: "Aaa",    start:2,   expected:0, },
        { pattern: "aaa",    name: "iaaai", input: "aaa",    start:2,   expected:0, },
        { pattern: "XAa",    name: "iwAai", input: " Aa",    start:2,   expected:1, },
        { pattern: "AAa",    name: "iAAai", input: "AAa",    start:2,   expected:0, },
        { pattern: "aAa",    name: "iaAai", input: "aAa",    start:2,   expected:1, },
        
        { pattern: "Xaa",    name: "iwaai", input: " aa",    start:3,   expected:1, },
        { pattern: "Aaa",    name: "iAaai", input: "Aaa",    start:3,   expected:0, },
        { pattern: "aaa",    name: "iaaai", input: "aaa",    start:3,   expected:0, },
        { pattern: "XAa",    name: "iwAai", input: " Aa",    start:3,   expected:1, },
        { pattern: "AAa",    name: "iAAai", input: "AAa",    start:3,   expected:2, },
        { pattern: "aAa",    name: "iaAai", input: "aAa",    start:3,   expected:1, },
        
        { pattern: "Xaa..",    name: "iwaaw",  input: " aa ",    start:2,   expected:1, },
        { pattern: "Aaa..",    name: "iAaaw",  input: "Aaa ",    start:2,   expected:0, },
        { pattern: "aaa..",    name: "iaaaw",  input: "aaa ",    start:2,   expected:0, },
        { pattern: "XAa..",    name: "iwAaw",  input: " Aa ",    start:2,   expected:1, },
        { pattern: "AAa..",    name: "iAAaw",  input: "AAa ",    start:2,   expected:0, },
        { pattern: "aAa..",    name: "iaAaw",  input: "aAa ",    start:2,   expected:1, },

        { pattern: "..XAaa..", name: "wwAaaw", input: "  Aaa ",  start:4,   expected:2, },
        { pattern: "..AAaa..", name: "wAAaaw", input: " AAaa ",  start:4,   expected:3, },
        { pattern: "..aAaa..", name: "waAaaw", input: " aAaa ",  start:4,   expected:2, },
        { pattern: "..XAAa..", name: "wwAAaw", input: "  AAa ",  start:4,   expected:2, },
        { pattern: "..AAAa..", name: "wAAAaw", input: " AAAa ",  start:4,   expected:1, },
        { pattern: "..aAAa..", name: "waAAaw", input: " aAAa ",  start:4,   expected:2, },
        { pattern: "..XaAa..", name: "wwaAaw", input: "  aAa ",  start:4,   expected:3, },
        { pattern: "..AaAa..", name: "wAaAaw", input: " AaAa ",  start:4,   expected:3, },
        { pattern: "..aaAa..", name: "waaAaw", input: " aaAa ",  start:4,   expected:3, },
        { pattern: "..Xaaa..", name: "wwaaaw", input: "  aaa ",  start:4,   expected:2, },
        { pattern: "..Aaaa..", name: "wAaaaw", input: " Aaaa ",  start:4,   expected:1, },
        { pattern: "..aaaa..", name: "waaaaw", input: " aaaa ",  start:4,   expected:1, },

        { pattern: "XAaa..",   name: "iwAaaw", input: " Aaa ",   start:3,   expected:1, },
        { pattern: "AAaa..",   name: "iAAaaw", input: "AAaa ",   start:3,   expected:2, },
        { pattern: "aAaa..",   name: "iaAaaw", input: "aAaa ",   start:3,   expected:1, },
        { pattern: "XAAa..",   name: "iwAAaw", input: " AAa ",   start:3,   expected:1, },
        { pattern: "AAAa..",   name: "iAAAaw", input: "AAAa ",   start:3,   expected:0, },
        { pattern: "aAAa..",   name: "iaAAaw", input: "aAAa ",   start:3,   expected:1, },
        { pattern: "XaAa..",   name: "iwaAaw", input: " aAa ",   start:3,   expected:2, },
        { pattern: "AaAa..",   name: "iAaAaw", input: "AaAa ",   start:3,   expected:2, },
        { pattern: "aaAa..",   name: "iaaAaw", input: "aaAa ",   start:3,   expected:2, },
        { pattern: "Xaaa..",   name: "iwaaaw", input: " aaa ",   start:3,   expected:1, },
        { pattern: "Aaaa..",   name: "iAaaaw", input: "Aaaa ",   start:3,   expected:0, },
        { pattern: "aaaa..",   name: "iaaaaw", input: "aaaa ",   start:3,   expected:0, },
        
        { pattern: "ああ",          name: "iHHi", input: "ああ",   start:1,   expected:0, },
        { pattern: "あ亜",          name: "iHJi", input: "あ亜",   start:1,   expected:0, },
        { pattern: "亜あ",          name: "iJHi", input: "亜あ",   start:1,   expected:0, },
        { pattern: "亜亜",          name: "iJJi", input: "亜亜",   start:1,   expected:0, },
        
        { pattern: "あああ",        name: "iHHHi", input: "あああ",   start:2,   expected:0, },
        { pattern: "ああ亜",        name: "iHHJi", input: "ああ亜",   start:2,   expected:0, },
        { pattern: "あ亜あ",        name: "iHJHi", input: "あ亜あ",   start:2,   expected:1, },
        { pattern: "あ亜亜",        name: "iHJJi", input: "あ亜亜",   start:2,   expected:1, },
        { pattern: "亜あ亜",        name: "iJHJi", input: "亜あ亜",   start:2,   expected:1, },
        { pattern: "亜あア",        name: "iJHKi", input: "亜あア",   start:2,   expected:1, },
        
        { pattern: "あああ..",      name: "iHHHw", input: "あああ ",   start:2,   expected:0, },
        { pattern: "ああ亜..",      name: "iHHJw", input: "ああ亜 ",   start:2,   expected:0, },
        { pattern: "あ亜あ..",      name: "iHJHw", input: "あ亜あ ",   start:2,   expected:1, },
        { pattern: "あ亜亜..",      name: "iHJJw", input: "あ亜亜 ",   start:2,   expected:1, },
        { pattern: "あ亜ア..",      name: "iHJKw", input: "あ亜ア ",   start:2,   expected:1, },
        
        { pattern: "..ああああ..",  name: "wHHHHw", input: " ああああ ",   start:4,   expected:1, },
        { pattern: "..あああ亜..",  name: "wHHHJw", input: " あああ亜 ",   start:4,   expected:1, },
        { pattern: "..ああ亜あ..",  name: "wHHJHw", input: " ああ亜あ ",   start:4,   expected:3, },
        { pattern: "..ああ亜亜..",  name: "wHHJJw", input: " ああ亜亜 ",   start:4,   expected:3, },
        { pattern: "..ああ亜ア..",  name: "wHHJKw", input: " ああ亜ア ",   start:4,   expected:3, },
        { pattern: "..あ亜亜あ..",  name: "wHJJHw", input: " あ亜亜あ ",   start:4,   expected:2, },
        { pattern: "..あａａあ..",  name: "wHbbHw", input: " あａａあ ",   start:4,   expected:2, },
        { pattern: "..あａＡあ..",  name: "wHbBHw", input: " あａＡあ ",   start:4,   expected:3, },
        { pattern: "..あＡａあ..",  name: "wHBbHw", input: " あＡａあ ",   start:4,   expected:3, },
        { pattern: "..あＡＡあ..",  name: "wHBBHw", input: " あＡＡあ ",   start:4,   expected:2, },
        
        { pattern: "ああああ..",    name: "iHHHHw", input: "ああああ ",   start:3,   expected:0, },
        { pattern: "ああ亜あ..",    name: "iHHJHw", input: "ああ亜あ ",   start:3,   expected:2, },
        { pattern: "あ亜ああ..",    name: "iHJHHw", input: "あ亜ああ ",   start:3,   expected:2, },
        { pattern: "あ亜亜あ..",    name: "iHJJHw", input: "あ亜亜あ ",   start:3,   expected:1, },
        { pattern: "あ亜アあ..",    name: "iHJKHw", input: "あ亜アあ ",   start:3,   expected:2, },
        
    ];
    
    /**
     * 単数行のテストデータ(moveRight,selectRight)
     */
    // pattern:パターン概要
    // name:文字タイプによるパターン説明(CharClass参照)、input:実文字列
    // start:開始カーソル位置、expected:コマンド実行後のカーソル位置
    //
    // カーソル位置例・・・"|aa"=0,"a|a"=1　。startとexpectedの位置は0相対。
    const cursolMoveTestDataToRight = [
        { pattern: "a",       name: "iai",   input: "a",     start:0,   expected:1, },//これは１行しか無いとき。
        { pattern: "a",       name: "iai",   input: "a",     start:1,   expected:1, },//これは１行しか無いとき。

        { pattern: "aa",      name: "iaai",  input: "aa",    start:0,   expected:2, },
        { pattern: "aA",      name: "iaAi",  input: "aA",    start:0,   expected:1, },
        { pattern: "Aa",      name: "iAai",  input: "Aa",    start:0,   expected:2, },
        { pattern: "AA",      name: "iAAi",  input: "AA",    start:0,   expected:2, },

        { pattern: "aAX",     name: "iaAwi", input: "aA ",   start:1,   expected:2, },
        { pattern: "AXa",     name: "iAwai", input: "A a",   start:1,   expected:2, },
        { pattern: "XAa",     name: "iwAai", input: " Aa",   start:1,   expected:3, },
        { pattern: "AAa",     name: "iAAai", input: "AAa",   start:1,   expected:2, },
        { pattern: "aAa",     name: "iaAai", input: "aAa",   start:1,   expected:3, },

        { pattern: "..aX",    name: "waXi",  input: " a ",    start:1,   expected:2, },
        { pattern: "..aA",    name: "waAi",  input: " aA",    start:1,   expected:2, },
        { pattern: "..aa",    name: "waai",  input: " aa",    start:1,   expected:3, },
        { pattern: "..AX",    name: "wAXi",  input: " A ",    start:1,   expected:2, },
        { pattern: "..AA",    name: "wAAi",  input: " AA",    start:1,   expected:3, },
        { pattern: "..Aa",    name: "wAai",  input: " Aa",    start:1,   expected:3, },

        { pattern: "..AaX..", name: "wAaww", input: " Aa  ",  start:1,   expected:3, },
        { pattern: "..AaA..", name: "wAaAw", input: " AaA ",  start:1,   expected:3, },
        { pattern: "..Aaa..", name: "wAaaw", input: " Aaa ",  start:1,   expected:4, },
        { pattern: "..AAX..", name: "wAAww", input: " AA  ",  start:1,   expected:3, },
        { pattern: "..AAA..", name: "wAAAw", input: " AAA ",  start:1,   expected:4, },
        { pattern: "..AAa..", name: "wAAaw", input: " AAa ",  start:1,   expected:3, },
        { pattern: "..aAX..", name: "waAww", input: " aA  ",  start:1,   expected:2, },
        { pattern: "..aAA..", name: "waAAw", input: " aAA ",  start:1,   expected:2, },
        { pattern: "..aAa..", name: "waAaw", input: " aAa ",  start:1,   expected:2, },
        { pattern: "..aaX..", name: "waaww", input: " aa  ",  start:1,   expected:3, },
        { pattern: "..aaA..", name: "waaAw", input: " aaA ",  start:1,   expected:3, },
        { pattern: "..aaa..", name: "waaaw", input: " aaa ",  start:1,   expected:4, },

        { pattern: "..AaX",   name: "wAawi", input: " Aa ",   start:1,   expected:3, },
        { pattern: "..AaA",   name: "wAaAi", input: " AaA",   start:1,   expected:3, },
        { pattern: "..Aaa",   name: "wAaai", input: " Aaa",   start:1,   expected:4, },
        { pattern: "..AAX",   name: "wAAwi", input: " AA ",   start:1,   expected:3, },
        { pattern: "..AAA",   name: "wAAAi", input: " AAA",   start:1,   expected:4, },
        { pattern: "..AAa",   name: "wAAai", input: " AAa",   start:1,   expected:3, },
        { pattern: "..aAX",   name: "waAwi", input: " aA ",   start:1,   expected:2, },
        { pattern: "..aAA",   name: "waAAi", input: " aAA",   start:1,   expected:2, },
        { pattern: "..aAa",   name: "waAai", input: " aAa",   start:1,   expected:2, },
        { pattern: "..aaX",   name: "waawi", input: " aa ",   start:1,   expected:3, },
        { pattern: "..aaA",   name: "waaAi", input: " aaA",   start:1,   expected:3, },
        { pattern: "..aaa",   name: "waaai", input: " aaa",   start:1,   expected:4, },

        { pattern: "X",       name: "iHi",   input: "あ",       start:0,   expected:1, },

        { pattern: "ああ",      name: "iHHi",  input: "ああ",     start:0,   expected:2, },
        { pattern: "亜あ",      name: "iJHi",  input: "亜あ",     start:0,   expected:1, },
        { pattern: "あ亜",      name: "iHJi",  input: "あ亜",     start:0,   expected:1, },
        { pattern: "亜亜",      name: "iJJi",  input: "亜亜",     start:0,   expected:2, },

        { pattern: "あああ",    name: "iHHHi", input: "あああ",   start:0,   expected:3, },
        { pattern: "亜ああ",    name: "iJHHi", input: "亜ああ",   start:0,   expected:1, },
        { pattern: "あ亜あ",    name: "iHJHi", input: "あ亜あ",   start:0,   expected:1, },
        { pattern: "ああ亜",    name: "iHHJi", input: "ああ亜",   start:0,   expected:2, },
        { pattern: "亜あア",    name: "iJHKi", input: "亜あア",   start:0,   expected:1, },

        { pattern: "..ああ",    name: "wHHi",  input: " ああ",    start:1,   expected:3, },
        { pattern: "..亜あ",    name: "wJHi",  input: " 亜あ",    start:1,   expected:2, },
        { pattern: "..あ亜",    name: "wHJi",  input: " あ亜",    start:1,   expected:2, },
        { pattern: "..亜亜",    name: "wJJi",  input: " 亜亜",    start:1,   expected:3, },

        { pattern: "..あああ..", name: "wHHHw", input: " あああ ", start:1,   expected:4, },
        { pattern: "..亜ああ..", name: "wJHHw", input: " 亜ああ ", start:1,   expected:2, },
        { pattern: "..あ亜あ..", name: "wHJHw", input: " あ亜あ ", start:1,   expected:2, },
        { pattern: "..ああ亜..", name: "wHHJw", input: " ああ亜 ", start:1,   expected:3, },
        { pattern: "..亜あア..", name: "wJHKw", input: " 亜あア ", start:1,   expected:2, },

        { pattern: "..あああ",   name: "wHHHi", input: " あああ",  start:1,   expected:4, },
        { pattern: "..亜ああ",   name: "wJHHi", input: " 亜ああ",  start:1,   expected:2, },
        { pattern: "..あ亜あ",   name: "wHJHi", input: " あ亜あ",  start:1,   expected:2, },
        { pattern: "..ああ亜",   name: "wHHJi", input: " ああ亜",  start:1,   expected:3, },
        { pattern: "..亜あア",   name: "wJHKi", input: " 亜あア",  start:1,   expected:2, },

        { pattern: "..あａａあ..",  name: "wHbbHw", input: " あａａあ ",  start:1,   expected:2, },
        { pattern: "..あａＡあ..",  name: "wHbBHw", input: " あａＡあ ",  start:1,   expected:2, },
        { pattern: "..あＡａあ..",  name: "wHBbHw", input: " あＡａあ ",  start:1,   expected:2, },
        { pattern: "..あＡＡあ..",  name: "wHBBHw", input: " あＡＡあ ",  start:1,   expected:2, },
        { pattern: "..ａａあ..",    name: "wbbHw",  input: " ａａあ ",    start:1,   expected:3, },
        { pattern: "..ａＡあ..",    name: "wbBHw",  input: " ａＡあ ",    start:1,   expected:2, },
        { pattern: "..Ａａあ..",    name: "wBbHw",  input: " Ａａあ ",    start:1,   expected:2, },
        { pattern: "..ＡＡあ..",    name: "wBBHw",  input: " ＡＡあ ",    start:1,   expected:3, },
        
        { pattern: "..ああああ..",  name: "wHHHHw", input: " ああああ ",  start:1,   expected:5, },

    ];

    /**
     * 複数行のテストデータ(moveLeft,selectLeft)
     */
    // pattern:パターン概要
    // name:文字タイプによるパターン説明(CharClass参照)、input:実文字列
    // startCol,startRow:開始カーソル位置、expectedCol,expectedRow:コマンド実行後のカーソル位置
    //
    // カーソル位置例・・・"|aa"=0,"a|a"=1　。startとexpectedの位置は0相対。
    const cursolMoveTestDataMultiToLeft = [
        { pattern: "\\n|\\n",  name: "i\\ni\\n",  input: "\n\n",  startCol:0, startRow:1, expectedCol:0, expectedRow:0, },
        { pattern: "w\\n|\\n", name: "iw\\ni\\n", input: " \n\n", startCol:0, startRow:1, expectedCol:1, expectedRow:0, },
    ];

    /**
     * 複数行のテストデータ(moveRight,selectRight)
     */
    // pattern:パターン概要
    // name:文字タイプによるパターン説明(CharClass参照)、input:実文字列
    // startCol,startRow:開始カーソル位置、expectedCol,expectedRow:コマンド実行後のカーソル位置
    //
    // カーソル位置例・・・"|aa"=0,"a|a"=1　。startとexpectedの位置は0相対。
    const cursolMoveTestDataMultiToRight = [
        { pattern: "|\\n\\n",  name: "i\\ni\\n",  input: "\n\n",  startCol:0, startRow:0, expectedCol:0, expectedRow:1, },
        { pattern: "w|\\n\\n", name: "iw\\ni\\n", input: " \n\n", startCol:1, startRow:0, expectedCol:0, expectedRow:1, },
    ];


    describe("moveWordPartLeftのテスト", () => {
        /**
         * テスト本体 単数行のカーソル挙動のテスト
         * (戻り値は0:左端。0相対になる。)
         * @param editor テスト用エディタ
         * @param wordSeparators テスト用区切り文字設定
         * @param content 検証元テキスト
         * @param start カーソルスタート位置
         * @returns number型 移動後のカーソル位置(ドキュメントの最初から何文字目か)
         */
        const doEachPattern = async function (
            editor: TextEditor,
            wordSeparators: string,
            content: string,
            start: number
        ): Promise<number> {
            await setText(editor, content);
            const initPos:Position = editor.document.positionAt(start);
            editor.selections = [new Selection(initPos, initPos)];
            await myExtension.moveWordPartLeft(editor, wordSeparators);
            return editor.document.offsetAt(editor.selection.start);
        };

        /**
         * テスト本体 複数行のカーソル挙動のテスト
         * (戻り値はPosition。character=0:左端。line=0:一番上の行。0相対になる。)
         * @param editor テスト用エディタ
         * @param wordSeparators テスト用区切り文字設定
         * @param content 検証元テキスト
         * @param startCol カーソルスタート位置(列)
         * @param startRow カーソルスタート位置(行)
         * @returns Position型 移動後のカーソル位置
         */
        const doEachPatternMultiRow = async function (
            editor: TextEditor,
            wordSeparators: string,
            content: string,
            startCol: number,
            startRow: number
        ): Promise<Position> {
            await setText(editor, content);
            const initPos = new Position(startRow,startCol);
            editor.selections = [new Selection(initPos, initPos)];
            await myExtension.moveWordPartLeft(editor, wordSeparators);
            return editor.document.positionAt(editor.document.offsetAt(editor.selection.start));
        };

        /**
         * 単数行のテスト
         */
        cursolMoveTestDataToLeft.forEach(t => {
            it("(単)moveWordPartLeft: "+t.name, async () => {
                const editor = vscode.window.activeTextEditor!;
                const mine:number = await doEachPattern(editor, "", t.input, t.start);
                if (mine !== t.expected) {
                    assert.fail("Unexpected result: {" +
                        escape`input: "${t.input}", ` +
                        escape`expected: "${t.expected}", ` +
                        escape`got: "${mine}"}`
                    );
                }
            });
        });


        /**
         * 複数行のテスト
         */
        cursolMoveTestDataMultiToLeft.forEach(t => {
            it("(複)moveWordPartLeft: "+t.name, async () => {
                const editor = vscode.window.activeTextEditor!;
                //console.log(t.input);
                const mine:Position = await doEachPatternMultiRow(editor, "", t.input, t.startCol,t.startRow);
                if (mine.character !== t.expectedCol || mine.line !== t.expectedRow) {
                    assert.fail("Unexpected result: {" +
                        escape`input: "${t.input}", ` +
                        escape`expectedCol: "${t.expectedCol}", ` +
                        escape`expectedRow: "${t.expectedRow}", ` +
                        escape`gotCol: "${mine.character}",`+
                        escape`gotRow: "${mine.line}"}`
                    );
                }
            });
        });
    });

    describe("moveWordPartRightのテスト", () => {
        /**
         * テスト本体 単数行のカーソル挙動のテスト
         * (戻り値は0:左端。0相対になる。)
         * @param editor テスト用エディタ
         * @param wordSeparators テスト用区切り文字設定
         * @param content 検証元テキスト
         * @param start カーソルスタート位置
         * @returns number型 移動後のカーソル位置(ドキュメントの最初から何文字目か)
         */
        const doEachPattern = async function (
            editor: TextEditor,
            wordSeparators: string,
            content: string,
            start: number
        ): Promise<number> {
            await setText(editor, content);
            const initPos:Position = new Position(0, start);
            editor.selections = [new Selection(initPos, initPos)];
            await myExtension.moveWordPartRight(editor, wordSeparators);
            return editor.document.offsetAt(editor.selection.start);
        };

        /**
         * テスト本体 複数行のカーソル挙動のテスト
         * (戻り値はPosition。character=0:左端。line=0:一番上の行。0相対になる。)
         * @param editor テスト用エディタ
         * @param wordSeparators テスト用区切り文字設定
         * @param content 検証元テキスト
         * @param startCol カーソルスタート位置(列)
         * @param startRow カーソルスタート位置(行)
         * @returns Position型 移動後のカーソル位置
         */
        const doEachPatternMultiRow = async function (
            editor: TextEditor,
            wordSeparators: string,
            content: string,
            startCol: number,
            startRow: number
        ): Promise<Position> {
            await setText(editor, content);
            const initPos = new Position(startRow,startCol);
            editor.selections = [new Selection(initPos, initPos)];
            await myExtension.moveWordPartRight(editor, wordSeparators);
            return editor.document.positionAt(editor.document.offsetAt(editor.selection.start));
        };

        /**
         * 単数行のテスト
         */
        cursolMoveTestDataToRight.forEach(t => {
            it("moveWordPartRight: " + t.name, async () => {
                const editor = vscode.window.activeTextEditor!;
                const mine = await doEachPattern(editor, "", t.input, t.start);
                if (mine !== t.expected) {
                    assert.fail("Unexpected result: {" +
                        escape`input: "${t.input}", ` +
                        escape`expected: "${t.expected}", ` +
                        escape`got: "${mine}"}`
                    );
                }
            });
        });

        /**
         * 複数行のテスト
         */
        cursolMoveTestDataMultiToRight.forEach(t => {
            it("(複)moveWordPartRight: "+t.name, async () => {
                const editor = vscode.window.activeTextEditor!;
                //console.log(t.input);
                const mine:Position = await doEachPatternMultiRow(editor, "", t.input, t.startCol,t.startRow);
                if (mine.character !== t.expectedCol || mine.line !== t.expectedRow) {
                    assert.fail("Unexpected result: {" +
                        escape`input: "${t.input}", ` +
                        escape`expectedCol: "${t.expectedCol}", ` +
                        escape`expectedRow: "${t.expectedRow}", ` +
                        escape`gotCol: "${mine.character}",`+
                        escape`gotRow: "${mine.line}"}`
                    );
                }
            });
        });

    });

    describe("moveWordPartLeftSelectのテスト", () => {
        /**
         * テスト本体 単数行のカーソル挙動のテスト
         * (戻り値は0:左端。0相対になる。)
         * @param editor テスト用エディタ
         * @param wordSeparators テスト用区切り文字設定
         * @param content 検証元テキスト
         * @param start カーソルスタート位置
         * @returns number型 移動後のカーソル位置(ドキュメントの最初から何文字目か)
         */
        const doEachPattern = async function (
            editor: TextEditor,
            wordSeparators: string,
            content: string,
            start: number
        ): Promise<number> {
            await setText(editor, content);
            const initPos:Position = editor.document.positionAt(start);
            editor.selections = [new Selection(initPos, initPos)];
            await myExtension.moveWordPartLeftSelect(editor, wordSeparators);
            return editor.document.offsetAt(editor.selection.start);
        };

        /**
         * テスト本体 複数行のカーソル挙動のテスト
         * (戻り値はPosition。character=0:左端。line=0:一番上の行。0相対になる。)
         * @param editor テスト用エディタ
         * @param wordSeparators テスト用区切り文字設定
         * @param content 検証元テキスト
         * @param startCol カーソルスタート位置(列)
         * @param startRow カーソルスタート位置(行)
         * @returns Position型 移動後のカーソル位置
         */
        const doEachPatternMultiRow = async function (
            editor: TextEditor,
            wordSeparators: string,
            content: string,
            startCol: number,
            startRow: number
        ): Promise<Position> {
            await setText(editor, content);
            const initPos = new Position(startRow,startCol);
            editor.selections = [new Selection(initPos, initPos)];
            await myExtension.moveWordPartLeftSelect(editor, wordSeparators);
            return editor.document.positionAt(editor.document.offsetAt(editor.selection.start));
        };

        /**
         * 単数行のテスト
         */
        cursolMoveTestDataToLeft.forEach(t => {
            it("(単)moveWordPartLeftSelect: "+t.name, async () => {
                const editor = vscode.window.activeTextEditor!;
                const mine:number = await doEachPattern(editor, "", t.input, t.start);
                if (mine !== t.expected) {
                    assert.fail("Unexpected result: {" +
                        escape`input: "${t.input}", ` +
                        escape`expected: "${t.expected}", ` +
                        escape`got: "${mine}"}`
                    );
                }
            });
        });


        /**
         * 複数行のテスト
         */
        cursolMoveTestDataMultiToLeft.forEach(t => {
            it("(複)moveWordPartLeftSelect: "+t.name, async () => {
                const editor = vscode.window.activeTextEditor!;
                //console.log(t.input);
                const mine:Position = await doEachPatternMultiRow(editor, "", t.input, t.startCol,t.startRow);
                if (mine.character !== t.expectedCol || mine.line !== t.expectedRow) {
                    assert.fail("Unexpected result: {" +
                        escape`input: "${t.input}", ` +
                        escape`expectedCol: "${t.expectedCol}", ` +
                        escape`expectedRow: "${t.expectedRow}", ` +
                        escape`gotCol: "${mine.character}",`+
                        escape`gotRow: "${mine.line}"}`
                    );
                }
            });
        });
    });

    describe("moveWordPartRightSelectのテスト", () => {
        /**
         * テスト本体 単数行のカーソル挙動のテスト
         * (戻り値は0:左端。0相対になる。)
         * @param editor テスト用エディタ
         * @param wordSeparators テスト用区切り文字設定
         * @param content 検証元テキスト
         * @param start カーソルスタート位置
         * @returns number型 移動後のカーソル位置(ドキュメントの最初から何文字目か)
         */
        const doEachPattern = async function (
            editor: TextEditor,
            wordSeparators: string,
            content: string,
            start: number
        ): Promise<number> {
            await setText(editor, content);
            const initPos:Position = new Position(0, start);
            editor.selections = [new Selection(initPos, initPos)];
            await myExtension.moveWordPartRightSelect(editor, wordSeparators);
            return editor.document.offsetAt(editor.selection.end);
        };

        /**
         * テスト本体 複数行のカーソル挙動のテスト
         * (戻り値はPosition。character=0:左端。line=0:一番上の行。0相対になる。)
         * @param editor テスト用エディタ
         * @param wordSeparators テスト用区切り文字設定
         * @param content 検証元テキスト
         * @param startCol カーソルスタート位置(列)
         * @param startRow カーソルスタート位置(行)
         * @returns Position型 移動後のカーソル位置
         */
        const doEachPatternMultiRow = async function (
            editor: TextEditor,
            wordSeparators: string,
            content: string,
            startCol: number,
            startRow: number
        ): Promise<Position> {
            await setText(editor, content);
            const initPos = new Position(startRow,startCol);
            editor.selections = [new Selection(initPos, initPos)];
            await myExtension.moveWordPartRightSelect(editor, wordSeparators);
            return editor.document.positionAt(editor.document.offsetAt(editor.selection.end));
        };

        /**
         * 単数行のテスト
         */
        cursolMoveTestDataToRight.forEach(t => {
            it("moveWordPartRightSelect: " + t.name, async () => {
                const editor = vscode.window.activeTextEditor!;
                const mine = await doEachPattern(editor, "", t.input, t.start);
                if (mine !== t.expected) {
                    assert.fail("Unexpected result: {" +
                        escape`input: "${t.input}", ` +
                        escape`expected: "${t.expected}", ` +
                        escape`got: "${mine}"}`
                    );
                }
            });
        });

        /**
         * 複数行のテスト
         */
        cursolMoveTestDataMultiToRight.forEach(t => {
            it("(複)moveWordPartRightSelect: "+t.name, async () => {
                const editor = vscode.window.activeTextEditor!;
                //console.log(t.input);
                const mine:Position = await doEachPatternMultiRow(editor, "", t.input, t.startCol,t.startRow);
                if (mine.character !== t.expectedCol || mine.line !== t.expectedRow) {
                    assert.fail("Unexpected result: {" +
                        escape`input: "${t.input}", ` +
                        escape`expectedCol: "${t.expectedCol}", ` +
                        escape`expectedRow: "${t.expectedRow}", ` +
                        escape`gotCol: "${mine.character}",`+
                        escape`gotRow: "${mine.line}"}`
                    );
                }
            });
        });

    });

    describe("deleteWordPartLeftのテスト", () => {
        /**
         * テスト本体 単数行のカーソル挙動のテスト
         * @param editor テスト用エディタ
         * @param wordSeparators テスト用区切り文字設定
         * @param content 検証元テキスト
         * @param start カーソルスタート位置
         * @returns string型 削除後の文字列
         */
        const doEachPattern = async function (
            editor: TextEditor,
            wordSeparators: string,
            content: string,
            start: number
        ): Promise<string> {
            await setText(editor, content);
            const initPos:Position = new Position(0, start);
            editor.selections = [new Selection(initPos, initPos)];
            await myExtension.deleteWordPartLeft(editor, wordSeparators);
            return editor.document.getText();
        };

        /**
         * テスト本体 複数行のカーソル挙動のテスト
         * @param editor テスト用エディタ
         * @param wordSeparators テスト用区切り文字設定
         * @param content 検証元テキスト
         * @param startCol カーソルスタート位置(列)
         * @param startRow カーソルスタート位置(行)
         * @returns string型 削除後の文字列
         */
        const doEachPatternMultiRow = async function (
            editor: TextEditor,
            wordSeparators: string,
            content: string,
            startCol: number,
            startRow: number
        ): Promise<string> {
            await setText(editor, content);
            const initPos = new Position(startRow,startCol);
            editor.selections = [new Selection(initPos, initPos)];
            await myExtension.deleteWordPartLeft(editor, wordSeparators);
            return editor.document.getText();
        };

        /**
         * 単数行のテスト
         */
        // pattern:パターン概要
        // name:文字タイプによるパターン説明(CharClass参照)、input:実文字列
        // start:開始カーソル位置、expected:コマンド実行後のカーソル位置
        //
        // カーソル位置例・・・"|aa"=0,"a|a"=1　。startとexpectedの位置は0相対。
        [
            { pattern: "a",     name: "iai",  input: "a",     start:0,   expected:"a", },//これは１行しか無いとき、そこにとどまる。

            { pattern: "aa",    name: "iaai", input: "aa",    start:1,   expected:"a", },
            { pattern: "Aa",    name: "iAai", input: "Aa",    start:1,   expected:"a", },
            { pattern: "aA",    name: "iaAi", input: "aA",    start:1,   expected:"A", },
            { pattern: "AA",    name: "iAAi", input: "AA",    start:1,   expected:"A", },

            { pattern: "Xaa",    name: "iwaai", input: " aa",    start:2,   expected:" a", },
            { pattern: "Aaa",    name: "iAaai", input: "Aaa",    start:2,   expected:"a", },
            { pattern: "aaa",    name: "iaaai", input: "aaa",    start:2,   expected:"a", },
            { pattern: "XAa",    name: "iwAai", input: " Aa",    start:2,   expected:" a", },
            { pattern: "AAa",    name: "iAAai", input: "AAa",    start:2,   expected:"a", },
            { pattern: "aAa",    name: "iaAai", input: "aAa",    start:2,   expected:"aa", },

            { pattern: "Xaa",    name: "iwaai", input: " aa",    start:3,   expected:" ", },
            { pattern: "Aaa",    name: "iAaai", input: "Aaa",    start:3,   expected:"", },
            { pattern: "aaa",    name: "iaaai", input: "aaa",    start:3,   expected:"", },
            { pattern: "XAa",    name: "iwAai", input: " Aa",    start:3,   expected:" ", },
            { pattern: "AAa",    name: "iAAai", input: "AAa",    start:3,   expected:"AA", },
            { pattern: "aAa",    name: "iaAai", input: "aAa",    start:3,   expected:"a", },
            
            { pattern: "Xaa..",    name: "iwaaw",  input: " aa ",    start:2,   expected:" a ", },
            { pattern: "Aaa..",    name: "iAaaw",  input: "Aaa ",    start:2,   expected:"a ", },
            { pattern: "aaa..",    name: "iaaaw",  input: "aaa ",    start:2,   expected:"a ", },
            { pattern: "XAa..",    name: "iwAaw",  input: " Aa ",    start:2,   expected:" a ", },
            { pattern: "AAa..",    name: "iAAaw",  input: "AAa ",    start:2,   expected:"a ", },
            { pattern: "aAa..",    name: "iaAaw",  input: "aAa ",    start:2,   expected:"aa ", },

            { pattern: "..XAaa..", name: "wwAaaw", input: "  Aaa ",  start:4,   expected:"  a ", },
            { pattern: "..AAaa..", name: "wAAaaw", input: " AAaa ",  start:4,   expected:" AAa ", },
            { pattern: "..aAaa..", name: "waAaaw", input: " aAaa ",  start:4,   expected:" aa ", },
            { pattern: "..XAAa..", name: "wwAAaw", input: "  AAa ",  start:4,   expected:"  a ", },
            { pattern: "..AAAa..", name: "wAAAaw", input: " AAAa ",  start:4,   expected:" a ", },
            { pattern: "..aAAa..", name: "waAAaw", input: " aAAa ",  start:4,   expected:" aa ", },
            { pattern: "..XaAa..", name: "wwaAaw", input: "  aAa ",  start:4,   expected:"  aa ", },
            { pattern: "..AaAa..", name: "wAaAaw", input: " AaAa ",  start:4,   expected:" Aaa ", },
            { pattern: "..aaAa..", name: "waaAaw", input: " aaAa ",  start:4,   expected:" aaa ", },
            { pattern: "..Xaaa..", name: "wwaaaw", input: "  aaa ",  start:4,   expected:"  a ", },
            { pattern: "..Aaaa..", name: "wAaaaw", input: " Aaaa ",  start:4,   expected:" a ", },
            { pattern: "..aaaa..", name: "waaaaw", input: " aaaa ",  start:4,   expected:" a ", },

            { pattern: "XAaa..",   name: "iwAaaw", input: " Aaa ",   start:3,   expected:" a ", },
            { pattern: "AAaa..",   name: "iAAaaw", input: "AAaa ",   start:3,   expected:"AAa ", },
            { pattern: "aAaa..",   name: "iaAaaw", input: "aAaa ",   start:3,   expected:"aa ", },
            { pattern: "XAAa..",   name: "iwAAaw", input: " AAa ",   start:3,   expected:" a ", },
            { pattern: "AAAa..",   name: "iAAAaw", input: "AAAa ",   start:3,   expected:"a ", },
            { pattern: "aAAa..",   name: "iaAAaw", input: "aAAa ",   start:3,   expected:"aa ", },
            { pattern: "XaAa..",   name: "iwaAaw", input: " aAa ",   start:3,   expected:" aa ", },
            { pattern: "AaAa..",   name: "iAaAaw", input: "AaAa ",   start:3,   expected:"Aaa ", },
            { pattern: "aaAa..",   name: "iaaAaw", input: "aaAa ",   start:3,   expected:"aaa ", },
            { pattern: "Xaaa..",   name: "iwaaaw", input: " aaa ",   start:3,   expected:" a ", },
            { pattern: "Aaaa..",   name: "iAaaaw", input: "Aaaa ",   start:3,   expected:"a ", },
            { pattern: "aaaa..",   name: "iaaaaw", input: "aaaa ",   start:3,   expected:"a ", },
            
            { pattern: "ああ",          name: "iHHi", input: "ああ",   start:1,   expected:"あ", },
            { pattern: "あ亜",          name: "iHJi", input: "あ亜",   start:1,   expected:"亜", },
            { pattern: "亜あ",          name: "iJHi", input: "亜あ",   start:1,   expected:"あ", },
            { pattern: "亜亜",          name: "iJJi", input: "亜亜",   start:1,   expected:"亜", },
            
            { pattern: "あああ",        name: "iHHHi", input: "あああ",   start:2,   expected:"あ", },
            { pattern: "ああ亜",        name: "iHHJi", input: "ああ亜",   start:2,   expected:"亜", },
            { pattern: "あ亜あ",        name: "iHJHi", input: "あ亜あ",   start:2,   expected:"ああ", },
            { pattern: "あ亜亜",        name: "iHJJi", input: "あ亜亜",   start:2,   expected:"あ亜", },
            { pattern: "亜あ亜",        name: "iJHJi", input: "亜あ亜",   start:2,   expected:"亜亜", },
            { pattern: "亜あア",        name: "iJHKi", input: "亜あア",   start:2,   expected:"亜ア", },
            
            { pattern: "あああ..",      name: "iHHHw", input: "あああ ",   start:2,   expected:"あ ", },
            { pattern: "ああ亜..",      name: "iHHJw", input: "ああ亜 ",   start:2,   expected:"亜 ", },
            { pattern: "あ亜あ..",      name: "iHJHw", input: "あ亜あ ",   start:2,   expected:"ああ ", },
            { pattern: "あ亜亜..",      name: "iHJJw", input: "あ亜亜 ",   start:2,   expected:"あ亜 ", },
            { pattern: "あ亜ア..",      name: "iHJKw", input: "あ亜ア ",   start:2,   expected:"あア ", },
            
            { pattern: "..ああああ..",  name: "wHHHHw", input: " ああああ ",   start:4,   expected:" あ ", },
            { pattern: "..あああ亜..",  name: "wHHHJw", input: " あああ亜 ",   start:4,   expected:" 亜 ", },
            { pattern: "..ああ亜あ..",  name: "wHHJHw", input: " ああ亜あ ",   start:4,   expected:" あああ ", },
            { pattern: "..ああ亜亜..",  name: "wHHJJw", input: " ああ亜亜 ",   start:4,   expected:" ああ亜 ", },
            { pattern: "..ああ亜ア..",  name: "wHHJKw", input: " ああ亜ア ",   start:4,   expected:" ああア ", },
            { pattern: "..あ亜亜あ..",  name: "wHJJHw", input: " あ亜亜あ ",   start:4,   expected:" ああ ", },
            { pattern: "..あａａあ..",  name: "wHbbHw", input: " あａａあ ",   start:4,   expected:" ああ ", },
            { pattern: "..あａＡあ..",  name: "wHbBHw", input: " あａＡあ ",   start:4,   expected:" あａあ ", },
            { pattern: "..あＡａあ..",  name: "wHBbHw", input: " あＡａあ ",   start:4,   expected:" あＡあ ", },
            { pattern: "..あＡＡあ..",  name: "wHBBHw", input: " あＡＡあ ",   start:4,   expected:" ああ ", },
            
            { pattern: "ああああ..",    name: "iHHHHw", input: "ああああ ",   start:3,   expected:"あ ", },
            { pattern: "ああ亜あ..",    name: "iHHJHw", input: "ああ亜あ ",   start:3,   expected:"あああ ", },
            { pattern: "あ亜ああ..",    name: "iHJHHw", input: "あ亜ああ ",   start:3,   expected:"あ亜あ ", },
            { pattern: "あ亜亜あ..",    name: "iHJJHw", input: "あ亜亜あ ",   start:3,   expected:"ああ ", },
            { pattern: "あ亜アあ..",    name: "iHJKHw", input: "あ亜アあ ",   start:3,   expected:"あ亜あ ", },
            
        ].forEach(t => {
            it("deleteWordPartLeft: " + t.name, async () => {
                const editor = vscode.window.activeTextEditor!;
                const mine = await doEachPattern(editor, "", t.input,t.start);
                if (mine !== t.expected) {
                    assert.fail("Unexpected result: {" +
                        escape`input: "${t.input}", ` +
                        escape`expected: "${t.expected}", ` +
                        escape`got: "${mine}"}`
                    );
                }
            });
        });

        /**
         * 複数行のテスト
         */
        // pattern:パターン概要
        // name:文字タイプによるパターン説明(CharClass参照)、input:実文字列
        // startCol,startRow:開始カーソル位置、expected:コマンド実行後の文字列
        //
        // カーソル位置例・・・"|aa"=0,"a|a"=1　。。
        [
            { pattern: "\\n|\\n",  name: "i\\ni\\n",  input: "\n\n",  startCol:0, startRow:1, expected:"\n", },
            { pattern: "w\\n|\\n", name: "iw\\ni\\n", input: " \n\n", startCol:0, startRow:1, expected:" \n", },
        ].forEach(t => {
            it("(複)deleteWordPartLeft: "+t.name, async () => {
                const editor = vscode.window.activeTextEditor!;
                //console.log(t.input);
                const mine:string = await doEachPatternMultiRow(editor, "", t.input, t.startCol,t.startRow);
                if (mine !== t.expected) {
                    assert.fail("Unexpected result: {" +
                        escape`input: "${t.input}", ` +
                        escape`expected: "${t.expected}", ` +
                        escape`gotRow: "${mine}"}`
                    );
                }
            });
        });

        //【TODO】もう少し充実させたい
        it("deleteWordPartLeftのundo", async () => {
            const editor = vscode.window.activeTextEditor!;

            // Execute my command
            const mine = await doEachPattern(editor, "", "abc",3);
            assert.equal(mine, "");

            // Undo and check the result
            await vscode.commands.executeCommand("undo");
            const text = await editor.document.getText();
            assert.equal(text, "abc");
        });
    });

    describe("deleteWordPartRightのテスト", () => {
        /**
         * テスト本体 単数行のカーソル挙動のテスト
         * @param editor テスト用エディタ
         * @param wordSeparators テスト用区切り文字設定
         * @param content 検証元テキスト
         * @param start カーソルスタート位置
         * @returns string型 削除後の文字列
         */
        const doEachPattern = async function (
            editor: TextEditor,
            wordSeparators: string,
            content: string,
            start: number
        ): Promise<string> {
            await setText(editor, content);
            const initPos:Position = new Position(0, start);
            editor.selections = [new Selection(initPos, initPos)];
            await myExtension.deleteWordPartRight(editor, wordSeparators);
            return editor.document.getText();
        };

        /**
         * テスト本体 複数行のカーソル挙動のテスト
         * @param editor テスト用エディタ
         * @param wordSeparators テスト用区切り文字設定
         * @param content 検証元テキスト
         * @param startCol カーソルスタート位置(列)
         * @param startRow カーソルスタート位置(行)
         * @returns string型 削除後の文字列
         */
        const doEachPatternMultiRow = async function (
            editor: TextEditor,
            wordSeparators: string,
            content: string,
            startCol: number,
            startRow: number
        ): Promise<string> {
            await setText(editor, content);
            const initPos = new Position(startRow,startCol);
            editor.selections = [new Selection(initPos, initPos)];
            await myExtension.deleteWordPartRight(editor, wordSeparators);
            return editor.document.getText();
        };

        /**
         * 単数行のテスト
         */
        // pattern:パターン概要
        // name:文字タイプによるパターン説明(CharClass参照)、input:実文字列
        // start:開始カーソル位置、expected:コマンド実行後のカーソル位置
        //
        // カーソル位置例・・・"|aa"=0,"a|a"=1　。startとexpectedの位置は0相対。
        [
            { pattern: "a",       name: "iai",   input: "a",     start:0,   expected:"", },//これは１行しか無いとき。
            { pattern: "a",       name: "iai",   input: "a",     start:1,   expected:"a", },//これは１行しか無いとき。

            { pattern: "aa",      name: "iaai",  input: "aa",    start:0,   expected:"", },
            { pattern: "aA",      name: "iaAi",  input: "aA",    start:0,   expected:"A", },
            { pattern: "Aa",      name: "iAai",  input: "Aa",    start:0,   expected:"", },
            { pattern: "AA",      name: "iAAi",  input: "AA",    start:0,   expected:"", },
            { pattern: "aAX",     name: "iaAwi", input: "aA ",   start:1,   expected:"a ", },
            { pattern: "AXa",     name: "iAwai", input: "A a",   start:1,   expected:"Aa", },
            { pattern: "XAa",     name: "iwAai", input: " Aa",   start:1,   expected:" ", },
            { pattern: "AAa",     name: "iAAai", input: "AAa",   start:1,   expected:"Aa", },
            { pattern: "aAa",     name: "iaAai", input: "aAa",   start:1,   expected:"a", },

            { pattern: "..aX",    name: "waXi",  input: " a ",    start:1,   expected:"  ", },
            { pattern: "..aA",    name: "waAi",  input: " aA",    start:1,   expected:" A", },
            { pattern: "..aa",    name: "waai",  input: " aa",    start:1,   expected:" ", },
            { pattern: "..AX",    name: "wAXi",  input: " A ",    start:1,   expected:"  ", },
            { pattern: "..AA",    name: "wAAi",  input: " AA",    start:1,   expected:" ", },
            { pattern: "..Aa",    name: "wAai",  input: " Aa",    start:1,   expected:" ", },

            { pattern: "..AaX..", name: "wAaww", input: " Aa  ",  start:1,   expected:"   ", },
            { pattern: "..AaA..", name: "wAaAw", input: " AaA ",  start:1,   expected:" A ", },
            { pattern: "..Aaa..", name: "wAaaw", input: " Aaa ",  start:1,   expected:"  ", },
            { pattern: "..AAX..", name: "wAAww", input: " AA  ",  start:1,   expected:"   ", },
            { pattern: "..AAA..", name: "wAAAw", input: " AAA ",  start:1,   expected:"  ", },
            { pattern: "..AAa..", name: "wAAaw", input: " AAa ",  start:1,   expected:" a ", },
            { pattern: "..aAX..", name: "waAww", input: " aA  ",  start:1,   expected:" A  ", },
            { pattern: "..aAA..", name: "waAAw", input: " aAA ",  start:1,   expected:" AA ", },
            { pattern: "..aAa..", name: "waAaw", input: " aAa ",  start:1,   expected:" Aa ", },
            { pattern: "..aaX..", name: "waaww", input: " aa  ",  start:1,   expected:"   ", },
            { pattern: "..aaA..", name: "waaAw", input: " aaA ",  start:1,   expected:" A ", },
            { pattern: "..aaa..", name: "waaaw", input: " aaa ",  start:1,   expected:"  ", },

            { pattern: "..AaX",   name: "wAawi", input: " Aa ",   start:1,   expected:"  ", },
            { pattern: "..AaA",   name: "wAaAi", input: " AaA",   start:1,   expected:" A", },
            { pattern: "..Aaa",   name: "wAaai", input: " Aaa",   start:1,   expected:" ", },
            { pattern: "..AAX",   name: "wAAwi", input: " AA ",   start:1,   expected:"  ", },
            { pattern: "..AAA",   name: "wAAAi", input: " AAA",   start:1,   expected:" ", },
            { pattern: "..AAa",   name: "wAAai", input: " AAa",   start:1,   expected:" a", },
            { pattern: "..aAX",   name: "waAwi", input: " aA ",   start:1,   expected:" A ", },
            { pattern: "..aAA",   name: "waAAi", input: " aAA",   start:1,   expected:" AA", },
            { pattern: "..aAa",   name: "waAai", input: " aAa",   start:1,   expected:" Aa", },
            { pattern: "..aaX",   name: "waawi", input: " aa ",   start:1,   expected:"  ", },
            { pattern: "..aaA",   name: "waaAi", input: " aaA",   start:1,   expected:" A", },
            { pattern: "..aaa",   name: "waaai", input: " aaa",   start:1,   expected:" ", },

            { pattern: "X",       name: "iHi",   input: "あ",       start:0,   expected:"", },

            { pattern: "ああ",      name: "iHHi",  input: "ああ",     start:0,   expected:"", },
            { pattern: "亜あ",      name: "iJHi",  input: "亜あ",     start:0,   expected:"あ", },
            { pattern: "あ亜",      name: "iHJi",  input: "あ亜",     start:0,   expected:"亜", },
            { pattern: "亜亜",      name: "iJJi",  input: "亜亜",     start:0,   expected:"", },

            { pattern: "あああ",    name: "iHHHi", input: "あああ",   start:0,   expected:"", },
            { pattern: "亜ああ",    name: "iJHHi", input: "亜ああ",   start:0,   expected:"ああ", },
            { pattern: "あ亜あ",    name: "iHJHi", input: "あ亜あ",   start:0,   expected:"亜あ", },
            { pattern: "ああ亜",    name: "iHHJi", input: "ああ亜",   start:0,   expected:"亜", },
            { pattern: "亜あア",    name: "iJHKi", input: "亜あア",   start:0,   expected:"あア", },

            { pattern: "..ああ",    name: "wHHi",  input: " ああ",    start:1,   expected:" ", },
            { pattern: "..亜あ",    name: "wJHi",  input: " 亜あ",    start:1,   expected:" あ", },
            { pattern: "..あ亜",    name: "wHJi",  input: " あ亜",    start:1,   expected:" 亜", },
            { pattern: "..亜亜",    name: "wJJi",  input: " 亜亜",    start:1,   expected:" ", },

            { pattern: "..あああ..", name: "wHHHw", input: " あああ ", start:1,   expected:"  ", },
            { pattern: "..亜ああ..", name: "wJHHw", input: " 亜ああ ", start:1,   expected:" ああ ", },
            { pattern: "..あ亜あ..", name: "wHJHw", input: " あ亜あ ", start:1,   expected:" 亜あ ", },
            { pattern: "..ああ亜..", name: "wHHJw", input: " ああ亜 ", start:1,   expected:" 亜 ", },
            { pattern: "..亜あア..", name: "wJHKw", input: " 亜あア ", start:1,   expected:" あア ", },

            { pattern: "..あああ",   name: "wHHHi", input: " あああ",  start:1,   expected:" ", },
            { pattern: "..亜ああ",   name: "wJHHi", input: " 亜ああ",  start:1,   expected:" ああ", },
            { pattern: "..あ亜あ",   name: "wHJHi", input: " あ亜あ",  start:1,   expected:" 亜あ", },
            { pattern: "..ああ亜",   name: "wHHJi", input: " ああ亜",  start:1,   expected:" 亜", },
            { pattern: "..亜あア",   name: "wJHKi", input: " 亜あア",  start:1,   expected:" あア", },

            { pattern: "..あａａあ..",  name: "wHbbHw", input: " あａａあ ",  start:1,   expected:" ａａあ ", },
            { pattern: "..あａＡあ..",  name: "wHbBHw", input: " あａＡあ ",  start:1,   expected:" ａＡあ ", },
            { pattern: "..あＡａあ..",  name: "wHBbHw", input: " あＡａあ ",  start:1,   expected:" Ａａあ ", },
            { pattern: "..あＡＡあ..",  name: "wHBBHw", input: " あＡＡあ ",  start:1,   expected:" ＡＡあ ", },
            { pattern: "..ａａあ..",    name: "wbbHw",  input: " ａａあ ",    start:1,   expected:" あ ", },
            { pattern: "..ａＡあ..",    name: "wbBHw",  input: " ａＡあ ",    start:1,   expected:" Ａあ ", },
            { pattern: "..Ａａあ..",    name: "wBbHw",  input: " Ａａあ ",    start:1,   expected:" ａあ ", },
            { pattern: "..ＡＡあ..",    name: "wBBHw",  input: " ＡＡあ ",    start:1,   expected:" あ ", },
            
            { pattern: "..ああああ..",  name: "wHHHHw", input: " ああああ ",  start:1,   expected:"  ", },

        ].forEach(t => {
            it("deleteWordPartRight: " + t.name, async () => {
                const editor = vscode.window.activeTextEditor!;
                const mine = await doEachPattern(editor, "", t.input,t.start);
                if (mine !== t.expected) {
                    assert.fail("Unexpected result: {" +
                        escape`input: "${t.input}", ` +
                        escape`expected: "${t.expected}", ` +
                        escape`got: "${mine}"}`
                    );
                }
            });
        });

        /**
         * 複数行のテスト
         */
        // pattern:パターン概要
        // name:文字タイプによるパターン説明(CharClass参照)、input:実文字列
        // startCol,startRow:開始カーソル位置、expected:コマンド実行後の文字列
        //
        // カーソル位置例・・・"|aa"=0,"a|a"=1　。。
        [
            { pattern: "|\\n\\n",  name: "i\\ni\\n",  input: "\n\n",  startCol:0, startRow:0, expected:"\n", },
            { pattern: "w|\\n\\n", name: "iw\\ni\\n", input: " \n\n", startCol:1, startRow:0, expected:" \n", },
        ].forEach(t => {
            it("(複)deleteWordPartRight: "+t.name, async () => {
                const editor = vscode.window.activeTextEditor!;
                //console.log(t.input);
                const mine:string = await doEachPatternMultiRow(editor, "", t.input, t.startCol,t.startRow);
                if (mine !== t.expected) {
                    assert.fail("Unexpected result: {" +
                        escape`input: "${t.input}", ` +
                        escape`expected: "${t.expected}", ` +
                        escape`gotRow: "${mine}"}`
                    );
                }
            });
        });

        //【TODO】もう少し充実させたい
        it("deleteWordPartRightのundo", async () => {
            const editor = vscode.window.activeTextEditor!;

            // Execute my command
            const mine = await doEachPattern(editor, "", "abc",0);
            assert.equal(mine, "");

            // Undo and check the result
            await vscode.commands.executeCommand("undo");
            const text = await editor.document.getText();
            assert.equal(text, "abc");
        });
    });

});

function escape(template: TemplateStringsArray, ...substitutions: any[]): string {
    return String.raw(template, substitutions)
        .replace(/\n/g, '\\n');
}

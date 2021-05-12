$(document).ready();
let dt = new Date();
let textCount = 1;
Vue.component("treeselect", VueTreeselect.Treeselect);

const app = new Vue({
    el: "#app",
    computed: {},
    data: {
        newDocument: new WikiXmlMetadata(),
        wikiDocuments: [],
        isInputDataValid: true,
        isMetadataComplete: true,
        isKeepFormat: "Yes",
        isAddHyperlink: true,
        urlFieldHint: "",
        isInputEmpty: false,
        wikiUrls: "",
        wikiContents: "",
        filename: "",
        isSeperateByParagraph: "default",
        isAddExtendedLinks: false,
        isAddMenuToDownload: false,
        extendedLinks: [],
        confirmLinks: [],
        sourceWord: "",
        corpusName: "",
        corpusDefault: "文獻集名稱：預設「我的資料集」",
        tableOfContents: [],
        tempMenuList: [],
        treeShowMenu: [],
        sortValueBy: "INDEX",
        valueConsistsOf: "ALL",
        tempSelectMenu: [],
        selectedBookMenuPool: [],
        menuIndexCount: 0,
        refLinks: [],
        selectRefLinks: [],
    },
    methods: {
        cleanUrlField: function () {
            this.wikiUrls = "";
            this.urlFieldHint = "";
            this.isInputEmpty = false;
            this.wikiDocuments = [];
            textCount = 1;
        },
        // parseWikiLinksFromUser: async function () {
        //     if (!this.checkForm()) return;
        //     for (wikiUrl of this.wikiUrls.split("\n").filter((x) => x)) {
        //         await getWikisourceJson(wikiUrl);
        //     }
        // },
        getQueryResult: function () {
            if (this.sourceWord == "") return;
            this.extendedLinks = [];
            this.confirmLinks = [];
            searchWord(this.sourceWord);
        },
        getSnippet: async function () {
            getSnippet("水經注");
        },
        getMenuOfContent: async function (index) {
            let targetFindExistedMenu = this.tableOfContents.find(
                (x) => x.index === index
            );
            this.menuIndexCount = index;
            if (targetFindExistedMenu != undefined) {
                this.treeShowMenu = targetFindExistedMenu.menu;
                this.isAddMenuToDownload = true;
            } else {
                await getWikisourceJson(this.extendedLinks[index], 0);
                this.tableOfContents.push({
                    index: index,
                    menu: this.tempMenuList,
                });
                this.treeShowMenu = this.tempMenuList;
            }
            this.tempMenuList = [];
            this.tempSelectMenu = [];
        },
        addSelectedMenuItem: function () {
            this.selectedBookMenuPool.push({
                menu: this.tempSelectMenu,
                index: this.menuIndexCount,
            });
            this.tempSelectMenu = [];
            this.isAddMenuToDownload = false;
        },
        getRefLink: function (index) {
            this.refLinks = [];
            getDeeperLink(this.extendedLinks[index]);
        },
        searchDeeper: function () {
            this.extendedLinks = [];
            this.confirmLinks = [];
            if (!this.checkForm()) return;
            getDeeperLink(this.wikiUrls);
        },
        checkForm: function (e) {
            if (!this.wikiUrls) {
                this.urlFieldHint = "is-danger";
                this.isInputEmpty = true;
                return 0;
            }
            return 1;
        },
        confirmAdd: function (flag) {
            let x = this.extendedLinks;
            let y = this.selectRefLinks;
            if (flag)
                this.extendedLinks = this.extendedLinks.concat(
                    this.selectRefLinks
                );
            this.isAddExtendedLinks = false;
        },
        checkContentValue: function (obj) {
            obj.isFixContent = !obj.isFixContent;
            obj.isContentOpen = !obj.isContentOpen;
        },
        deleteContentValue: function (index) {
            this.wikiDocuments.splice(index, 1);
        },
        download: function () {
            let element = document.createElement("a");
            let filename =
                this.filename == ""
                    ? `${dt.getFullYear()}_${dt.getMonth()}_${dt.getDate()}.xml`
                    : this.filename;
            element.setAttribute(
                "href",
                "data:text/xml;charset=utf-8," +
                    encodeURIComponent(this.wikiContents)
            );
            element.setAttribute("download", filename);
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        },
        copyTestingCode() {
            let testingCodeToCopy = $("#wikiContents").select(function () {
                try {
                    var successful = document.execCommand("copy");
                    var msg = successful ? "successful" : "unsuccessful";
                    alert("Testing code was copied ");
                } catch (err) {
                    alert("Oops, unable to copy");
                }
                /* unselect the range */
            });
            testingCodeToCopy.setAttribute("type", "hidden");
            window.getSelection().removeAllRanges();
        },
        onCopy: function (e) {
            alert(`Copying Success!!`);
        },
        compressToParagraph: function () {
            this.wikiDocuments = this.wikiDocuments.sort(function (a, b) {
                return a.order > b.order ? 1 : -1;
            });
            for (let wikiDocument of this.wikiDocuments) {
                wikiDocument.isImport.corpus =
                    this.corpusName === "" ? "我的資料集" : this.corpusName;
            }
            let answer = "";
            if (this.isSeperateByParagraph == "default") {
                answer = convertAlltoDocuments(
                    this.wikiDocuments,
                    this.isAddHyperlink
                );
            } else if (this.isSeperateByParagraph == "seperateEachParagraph") {
                answer = convertParagraphToDocuments(
                    this.wikiDocuments,
                    this.isAddHyperlink
                );
            } else {
                answer = convertAlltoParagraphs(
                    this.wikiDocuments,
                    this.isAddHyperlink
                );
            }
            this.wikiContents = answer;
        },
        selectAllExtendLinks: function () {
            this.extendedLinks.forEach((ele) => {
                this.confirmLinks.push(ele);
            });
        },
        reset: function () {
            this.newDocument = new WikiXmlMetadata();
            this.wikiDocuments = [];
            this.isInputDataValid = true;
            this.isMetadataComplete = true;
            this.isKeepFormat = "Yes";
            this.isAddHyperlink = true;
            this.urlFieldHint = "";
            this.isInputEmpty = false;
            this.wikiUrls = "";
            this.wikiContents = "";
            this.filename = "";
            this.isSeperateByParagraph = "default";
            this.isAddExtendedLinks = false;
            this.extendedLinks = [];
            this.confirmLinks = [];
            this.sourceWord = "";
            this.corpusName = "";
            this.corpusDefault = "文獻集名稱：預設「我的資料集」";
            textCount = 1;
        },
    },
});

async function getDeeperLink(pageNames) {
    pageNames = pageNames.split("\n").filter((x) => x);
    for (pageName of pageNames) {
        try {
            let apiBackJson = await axios.get(
                "https://zh.wikisource.org/w/api.php",
                {
                    params: {
                        action: "parse",
                        page: pageName,
                        origin: "*",
                        format: "json",
                        utf8: "",
                    },
                }
            );
            let newLinks = await getExtendedLinks(apiBackJson.data.parse);
            newLinks = newLinks.filter((x) => x.indexOf(pageNames) === -1);
            app.refLinks = app.refLinks.concat(newLinks);
        } catch (error) {
            console.log(error);
            alert(`請求出錯！`);
        }
    }
    app.isAddExtendedLinks = true;
}

async function searchWord(title) {
    try {
        let apiBackJson = await axios.get(
            "https://zh.wikisource.org/w/api.php",
            {
                params: {
                    action: "query",
                    list: "search",
                    srsearch: title,
                    origin: "*",
                    format: "json",
                    utf8: "",
                    srlimit: 100,
                },
            }
        );
        let outputs = await apiBackJson.data.query.search;
        console.log(outputs);
        outputs = outputs.map((x) =>
            x?.title.replace(/\/.*$/g, "").replace(/[0-9\-]*$/g, "")
        );
        app.extendedLinks = [...new Set(outputs)];
    } catch (error) {
        console.log(error);
        alert(`請求出錯！`);
    }
    // app.isAddExtendedLinks = true;
}

function WikiXmlMetadata(
    title = "",
    author = "",
    doc_content = [
        {
            paragraphs: "",
            hyperlinks: "",
        },
    ]
) {
    this.isImport = {};
    this.isImport.corpus = title;
    this.isImport.title = title;
    this.isImport.author = author;
    this.isImport.doc_source = title.replace(/\/.*/gi, "");
    this.isImport.doc_topic_l1 = "";
    this.isImport.doc_topic_l2 = "";
    this.isImport.doc_topic_l3 = "";
    this.isImport.geo_level1 = "";
    this.isImport.geo_level2 = "";
    this.isImport.geo_level3 = "";
    this.isImport.geo_longitude = "";
    this.isImport.geo_latitude = "";
    this.isImport.doc_category_l1 = "";
    this.isImport.doc_category_l2 = "";
    this.isImport.doc_category_l3 = "";
    this.isImport.docclass = "";
    this.isImport.doc_content = "";
    this.isImport.docclass_aux = "";
    this.isImport.doctype = "";
    this.isImport.doctype_aux = "";
    this.isImport.book_code = "";
    this.isImport.time_orig_str = "";
    this.isImport.time_varchar = "";
    this.isImport.time_norm_year = "";
    this.isImport.era = "";
    this.isImport.time_norm_kmark = "";
    this.isImport.year_for_grouping = "";
    this.isImport.time_dynasty = "";
    this.isImport.doc_seq_number = "";
    this.isImport.timeseq_not_before = "";
    this.isImport.timeseq_not_after = "";
    this.isImport.doc_attachment = "";
    this.isFixContent = false;
    this.isContentOpen = true;
    this.tempContent = doc_content;
    this.fulltext = doc_content.map((x) => x.paragraphs).join("\n");
    this.order = textCount;
}

function parseHtmlText(htmlContent, title) {
    let doc = new DOMParser().parseFromString(htmlContent, "text/html");
    let wikiContentSeperateParagraph = [];
    let mainContent = $(doc).find(".mw-parser-output p,.mw-parser-output dd");

    if (
        $(mainContent).text() !== undefined &&
        $(mainContent).text().match(/重定向/g)
    ) {
        alert(
            `頁面:"${title}"被重新導向至"${$(doc)
                .find(".mw-parser-output a")
                .text()}"，請察看維基文庫頁面確認正確標題或搜尋`
        );
    }

    for (let x = 0; x < 10; x++) {
        $(mainContent)
            .find("*:not(a)")
            .each(function (index, element) {
                // console.log($(element).html());
                let x = $(element).html();
                $(element).replaceWith(x);
            });
    }

    $(mainContent)
        .find("a")
        .each(function (index, element) {
            let linkTitle = $(element).html();
            let linkRef =
                $(element).attr("href") !== undefined &&
                $(element)
                    .attr("href")
                    .match(/^\/wiki\//g)
                    ? `https://zh.wikisource.org${$(element).attr("href")}`
                    : $(element).attr("href");
            $(element).replaceWith(
                composeXmlString(
                    linkTitle,
                    "Udef_wiki",
                    1,
                    ` Term="${linkTitle}" Url="${linkRef}"`
                )
            );
        });

    $(mainContent).each(function (index, element) {
        let parseSentence = $(element)
            .text()
            .replace(/\s/gm, "")
            .replace(/^\r\n|^\n/gm, "")
            .replace(
                /（并请在校对之后从条目的源代码中删除本模版：{{简转繁}}）/gm,
                ""
            )
            .replace(/&lt;(\W+)&gt;/g, "【$1】");
        let parseSentenceWithHtml = $(element)
            .html()
            .replace(/&lt;(\W+)&gt;/g, "【$1】");
        if (!/(屬於公有領域)/gm.test(parseSentence) && parseSentence != "") {
            wikiContentSeperateParagraph.push({
                paragraphs: parseSentence,
                hyperlinks: parseSentenceWithHtml
                    .replace(/udef_wiki/g, "Udef_wiki")
                    .replace(/url/g, "Url")
                    .replace(/term/g, "Term"),
            });
        }
    });
    return wikiContentSeperateParagraph;
}

function parseAuthor(htmlContent) {
    let doc = new DOMParser().parseFromString(htmlContent, "text/html");
    let wikiAuthor = "";
    $(doc)
        .find(`a`)
        .each(function (index, element) {
            if (
                $(element).prop("title") !== undefined &&
                $(element)
                    .prop("title")
                    .match(/Author:.*/)
            ) {
                wikiAuthor = $(element)
                    .prop("title")
                    .replace(/Author:|（(頁面不存在)*）/g, "");
            }
        });
    return wikiAuthor;
}

function parseHtmlHyperlinkText(htmlContent) {
    let doc = new DOMParser().parseFromString(htmlContent, "text/html");
    let wikiContentSeperateParagraph = [];
    $(doc)
        .find(`a`)
        .each(function (index, element) {
            if (
                $(element).attr("href") != undefined &&
                $(element).text() !== "" &&
                $(element)
                    .attr("href")
                    .match(/^\/wiki\//g)
            ) {
                let wikilink =
                    $(element).attr("href") !== undefined &&
                    $(element)
                        .attr("href")
                        .match(/^\/wiki\//g)
                        ? `https://zh.wikisource.org${$(element).attr("href")}`
                        : $(element).attr("href");
                wikiContentSeperateParagraph.push(
                    `<Udef_wiki Term="${$(
                        element
                    ).text()}" Url="${wikilink}">${$(
                        element
                    ).text()}<Udef_wiki>`
                );
            }
        });
    return wikiContentSeperateParagraph.join("\n");
}

async function getExtendedLinks(wikiJson) {
    let wikiKeyword = [];
    if (wikiJson.hasOwnProperty("links")) {
        wikiJson.links.forEach((element, index) => {
            if (isEssensialKey(element["*"])) {
                wikiKeyword.push(element["*"]);
            }
        });
    }
    return wikiKeyword;
}

function convertAlltoDocuments(wikiObjs, isAddHyperlink = true) {
    let eachDoc = "";
    let allDocs = [];
    wikiObjs.forEach((obj, index) => {
        let fullContext = obj.tempContent
            .map((x) =>
                isAddHyperlink
                    ? composeXmlString(x.hyperlinks, "Paragraph", 1)
                    : composeXmlString(x.paragraphs, "Paragraph", 1)
            )
            .join("\n");
        for (let docVal in obj.isImport) {
            eachDoc +=
                docVal == "doc_content"
                    ? composeXmlString(fullContext, docVal, 1)
                    : composeXmlString(obj.isImport[docVal], docVal);
        }
        allDocs.push(
            composeXmlString(
                eachDoc,
                "document",
                1,
                ` filename="${padding(index + 1, 3)}.txt"`
            )
        );
        eachDoc = "";
    });
    let final = endFile(allDocs.join("\n"));
    return final.replace(/^\r\n|^\n/gm, "");
}

function convertAlltoParagraphs(wikiObjs, isAddHyperlink = true) {
    let allParagraphs = [];
    let eachDoc = "";
    wikiObjs.forEach((obj, index) => {
        allParagraphs.push(
            obj.tempContent
                .map((x) =>
                    isAddHyperlink
                        ? composeXmlString(x.hyperlinks, "Paragraph", 1)
                        : composeXmlString(x.paragraphs, "Paragraph", 1)
                )
                .join("\n")
        );
    });

    allParagraphs = allParagraphs.join("\n");

    for (let docVal in wikiObjs[0].isImport) {
        eachDoc +=
            docVal == "doc_content"
                ? composeXmlString(allParagraphs, docVal, 1)
                : composeXmlString(wikiObjs[0].isImport[docVal], docVal);
    }

    let final = composeXmlString(
        eachDoc,
        "document",
        1,
        ` filename="${padding(1, 3)}.txt"`
    );
    return endFile(final).replace(/^\r\n|^\n/gm, "");
}

function convertParagraphToDocuments(wikiObjs, isAddHyperlink = true) {
    let docs = [];
    let eachDoc = "";
    let count = 1;
    wikiObjs.forEach((obj, index) => {
        obj.tempContent.forEach((paraData, ind) => {
            let eachWikiDoc = isAddHyperlink
                ? composeXmlString(paraData.hyperlinks, "Paragraph", 1)
                : composeXmlString(paraData.paragraphs, "Paragraph", 1);
            for (let docVal in obj.isImport) {
                eachDoc +=
                    docVal == "doc_content"
                        ? composeXmlString(eachWikiDoc, docVal, 1)
                        : composeXmlString(obj.isImport[docVal], docVal);
            }
            docs.push(
                composeXmlString(
                    eachDoc,
                    "document",
                    1,
                    ` filename="${padding(count, 3)}.txt"`
                )
            );
            eachDoc = "";
            count++;
        });
    });

    let final = endFile(docs.join("\n"));
    return final.replace(/^\r\n|^\n/gm, "");
}

function endFile(data = "") {
    let corpusContent = `<corpus name="*">
<metadata_field_settings>
<author>作者</author>
<title>Wiki文本標題</title>
<doc_content>文本內容</doc_content>
</metadata_field_settings>
<feature_analysis>
<tag name="Udef_wiki" type="contentTagging" default_category="Udef_wiki" default_sub_category="-"/>
</feature_analysis>
</corpus>`;
    return `<?xml version="1.0"?>${composeXmlString(
        corpusContent + composeXmlString(data, "documents", 1),
        "ThdlPrototypeExport",
        1
    )}`;
}

function padding(num, length) {
    for (var len = (num + "").length; len < length; len = num.length) {
        num = "0" + num;
    }
    return num;
}

function isEssensialKey(text) {
    return text.match(
        /(Category.*)|(Author.*)|(Wikisource.*)|(Template.*)|(模块.*)/g
    )
        ? false
        : true;
}

function composeXmlString(source, xmlAttribute, isBreak = 0, addValue = "") {
    return isBreak == 0
        ? `<${xmlAttribute}${addValue}>${source}</${xmlAttribute}>\n`
        : `\n<${xmlAttribute}${addValue}>\n${source}\n</${xmlAttribute}>\n`;
}

async function getWikisourceJson(title, count, saveContent = {}) {
    if (!("numOfDir" in saveContent)) {
        saveContent.numOfDir = 0;
    }
    try {
        let apiBackJson = await axios.get(
            "https://zh.wikisource.org/w/api.php?format=json&action=query&prop=revisions&rvprop=content&utf8",
            {
                params: {
                    titles: title,
                    origin: "*",
                },
            }
        );
        // console.log(`recusive來到：${recursionCount}`);
        // await sleep(300);
        apiBackJson = apiBackJson.data;
        // console.log(apiBackJson);
        let wikiDocNum = getWikiNum(apiBackJson.query.pages);
        let dirtyText = apiBackJson.query.pages[wikiDocNum].revisions[0]["*"];
        let wikiTitle = apiBackJson.query.pages[wikiDocNum].title;
        // console.log(dirtyText);
        let cleanText = dirtyText.match(/.*\[\[(\/*.*)\|*.*\]\]/gm);
        cleanText = cleanText
            .join("\n")
            .replace(/^\n/gm, "")
            .replace(/^\n/gm, "");
        cleanText = cleanText.match(/^[*#!].*\[\[(.*)\|*.*\]\]/gm);
        if (cleanText) {
            cleanText = cleanText.join("\n");

            cleanText = cleanText
                .replace(/.*\[\[(.*\/*.*)\|*.*\]\]/gm, "$1")
                .replace(/\|.*/gm, "");
            let wikiArrayCut = cleanText.split("\n");
            saveContent.numOfDir += wikiArrayCut.length;
            for (let i = 0; i < wikiArrayCut.length; i++) {
                saveContent.numOfDir--;
                if (/^\/.*/.test(wikiArrayCut[i])) {
                    wikiArrayCut[i] = wikiTitle + wikiArrayCut[i];
                }
                if (
                    app.tempMenuList.indexOf(wikiArrayCut[i]) == -1 &&
                    !/.*全覽.*/.test(wikiArrayCut[i])
                ) {
                    app.tempMenuList.push({
                        index: i,
                        value: wikiArrayCut[i],
                    });
                    // console.log(
                    //     `這是第${count}層，祖宗/title是${title},${wikiArrayCut[i]}\n`
                    // );
                    getWikisourceJson(wikiArrayCut[i], count + 1, saveContent);
                }
            }
            console.log(`目前的count來到：${saveContent.numOfDir}`);
            if (saveContent.numOfDir === 0) {
                tableTreeGenerate(app.tempMenuList);
            }
        } else if (!cleanText && saveContent.numOfDir == 0) {
            app.tempMenuList.push({
                index: 0,
                value: title,
            });
            tableTreeGenerate(app.tempMenuList);
        }
    } catch (error) {
        // console.log(error);
    }
}

function getWikiNum(json) {
    let target = "";
    for (const key in json) {
        if (/\d+/.test(key)) {
            target = key;
        }
    }
    // console.log(target);
    return target;
}

function tableTreeGenerate(wikis) {
    let items = wikis,
        result = [];
    items.forEach(function (path) {
        let logArray = path.value.split("/");
        logArray.reduce(function (level, key, index) {
            let temp = level.find(({ id }) => key === id);
            let isLeaf = true;
            if (!temp) {
                isLeaf = index === logArray.length ? true : false;
                temp = {
                    id: key,
                    label: key,
                    index: path.index,
                    value: "",
                    isLeaf: isLeaf,
                    children: [],
                };
                level.push(temp);
            }
            return temp.children;
        }, result);
    });
    treeIndexSort(result);
    console.log(result);
    app.tempMenuList = result;
    app.isAddMenuToDownload = true;
}

function treeIndexSort(resultTree, path = "", count = 1) {
    for (
        let iterTreeCount = 0;
        iterTreeCount < resultTree.length;
        iterTreeCount++
    ) {
        resultTree[iterTreeCount].index = count;
        resultTree[
            iterTreeCount
        ].id = `${path}/${resultTree[iterTreeCount].label}`.replace(/^\//, "");
        let expo = resultTree[iterTreeCount];
        count++;
        if (resultTree[iterTreeCount].children.length !== 0) {
            count = treeIndexSort(
                resultTree[iterTreeCount].children,
                resultTree[iterTreeCount].id,
                count
            );
        } else {
            resultTree[iterTreeCount].isLeaf = true;
        }
    }
    return count;
}

async function getSnippet(title) {
    try {
        let apiBackJson = await axios.get(
            "https://zh.wikisource.org/w/api.php?format=json&action=query&prop=revisions&rvprop=content&utf8",
            {
                params: {
                    titles: title,
                    origin: "*",
                },
            }
        );
        apiBackJson = apiBackJson.data;
        let wikiDocNum = getWikiNum(apiBackJson.query.pages);
        let dirtyText = apiBackJson.query.pages[wikiDocNum].revisions[0]["*"];
        let wikiTitle = apiBackJson.query.pages[wikiDocNum].title;
    } catch (error) {
        // console.log(error);
    }
}

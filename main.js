$( document ).ready(function() {
    console.log( "ready!" );
});

Vue.component("menu-list", {
    template: `<div id="menu-list" class="content"> 
    <div v-for="newTree in treeData">
    <item :tree="newTree"></item>
  </div></div>`,
    data() {
        return {
            targetSearch: [],
        };
    },
    props: ["tree-data"],
});

Vue.component("item", {
    template: `
    <div style="margin-left: 2em">
      <input type="checkbox" :value="tree.id">
      <a href="#" @click.stop="toggle">{{tree.id}}</a>
      <div v-show="open" v-if="tree.children && tree.children.length > 0">
        <item v-for="(children, index) in tree.children" :tree="children" :key="index" >
        </item>
      </div>
    </div>
  `,
    props: ["tree"],
    data() {
        return {
            open: false,
        };
    },
    methods: {
        toggle() {
            if (this.tree.children && this.tree.children.length > 0) {
                this.open = !this.open;
            }
        },
    },
});

Vue.component("highlight-tag", {
    template: `
    <div class="content">
        <input v-model="isCheckHl" type="checkbox" name="" id="" />
        <label for="checkbox">是否高光</label>
        <p>
            這一天的天氣很好我們應該<span
                :style="{ 'color': isCheckHl ? 'white' : 'inherit', 'background-color': isCheckHl ? 'green' : 'white' }"
                >取走走</span
            >到處看看花草植物
        </p>
    </div>
  `,
    props: ["tree"],
    data() {
        return {
            isCheckHl: false,
        };
    },
    methods: {},
});

Vue.component("search-book", {
    template: `
    <div class="content">
        <input v-model="isCheckHl" type="checkbox" name="" id="" />
        <label for="checkbox">是否高光</label>
        <p>
            這一天的天氣很好我們應該<span
                :style="{ 'color': isCheckHl ? 'white' : 'inherit', 'background-color': isCheckHl ? 'green' : 'white' }"
                >取走走</span
            >到處看看花草植物
        </p>
    </div>
  `,
    props: ["isGetResult"],
    data() {
        return {
            isCheckHl: false,
        };
    },
    methods: {},
});

Vue.component("treeselect", VueTreeselect.Treeselect);
const app = new Vue({
    el: "#app",
    data: {
        wordSelection: undefined,
        wordRange: undefined,
        wikiTags: "",
        selectTag: "",
        isTagOpen: false,
        open: false,
        overlay: true,
        fullheight: true,
        fullwidth: false,
        right: false,
        isImageModalActive: false,
        isCardModalActive: false,
        isOpenMenu: false,
        menuOfWiki: [],
        keyword: "",
        testInputCut: "",
        testOutput: [],
        searchResult: "",
        filterResult: [],
        getCleanText: "",
        contentNeededList: null,
        sortValueBy: "INDEX",
        valueConsistsOf: "ALL",
        test: `
<p>《水經注》四十卷，後魏酈道元撰。道元字善長，范陽人，官至御史中尉，事跡具《魏書‧酷吏傳》。自晉以來，注《水經》者凡二家。郭璞注三卷，杜佑作《通典》時猶見之。今惟道元所注存。《崇文總目》稱其中已佚五卷，故《元和郡縣志》、《太平寰宇記》所引滹沱水、洛水、涇水，皆不見於今書。然今書仍作四十卷，蓋宋人重刊，分析以足原數也。是書自明以來，絕無善本。惟朱謀㙔所校，盛行於世，猶屬宋槧善本也。而舛謬亦復相仍。今以《永樂大典》所引，各案水名，逐條參校。非惟字句之譌，層出疊見。其中脫簡錯簡，有自數十字至四百餘字者，其道元自序一篇，諸本皆佚，亦惟《永樂大典》僅存。蓋當時所據，猶屬宋槧善本也。

謹排比原文，與近代本鉤稽校勘。凡補其闕漏者，二千一百二十八字；刪其妄增者，一千四百四十八字；正其臆改者，三千七百一十五字。神明煥然，頓還舊觀，三四百年之疑竇，一旦曠若發蒙。是皆我皇上稽古右文，經籍道盛，瑯嬛宛委之祕，響然竝臻。遂使前代遺編，幸逢昌運，發其光於蠹簡之中，若有神物撝呵，以待聖朝而出者，是亦曠世之一遇矣。至於經文注語，諸本率多混淆。今考驗舊文，得其端緒。凡水道所經之地，經則雲過，注則雲逕。經則統擧都會，注則兼及繁碎地名。凡一水之名，經則首句標明，後不重擧，注則文多旁涉，必重擧其名以更端。凡書內郡縣，經則但擧當時之名，注則兼考故城之跡。皆尋其義例，一一釐定，各以案語附於下方。至塞外羣流、江南諸派，道元足跡，皆所未經，故於灤河之正源、三藏水之次序、白檀要陽之建置，俱不免附會乖錯。甚至以浙江妄合姚江，尤爲傳聞失實。</p>`
    },
    methods: {
        getPos: function (e) {
            console.log(e.pageX, e.pageY);
        },
        print: function (e) {
            this.isTagOpen = true;
            this.$nextTick(() => {
                this.$refs.selbox.style.left = `${e.pageX}px`;
                this.$refs.selbox.style.top = `${e.pageY}px`;
            });
            this.wordSelection = window.getSelection();
        },
        setTag: function () {
            let z = this.wordSelection.toString();
            console.log(z)
            let y = document.createElement("mark");
            y.setAttribute('tag', this.selectTag);
            y.appendChild(document.createTextNode(z));
            this.wordSelection.deleteFromDocument();
            this.wordSelection.getRangeAt(0).insertNode(y);
            this.isTagOpen = false;
        },
        getTableOfContents: async function () {
            this.menuOfWiki = [];
            await getWikisourceJson(this.keyword, 0);
        },
        cutText: function () {
            this.testOutput = this.testInputCut
                .split(/[(####)|(\n)]/)
                .map((x) => x.trim())
                .filter((el) => {
                    return el != null && el != "";
                });
        },
        filterSearchResult: function () {
            let filterResult = this.searchResult
                .split("\n")
                .map((x) => x.replace(/\/.*$/g, ""));
            this.filterResult = [...new Set(filterResult)];
        },
    },
    computed: {
        splitWikiTags: function () {
            return this.wikiTags.split(",").filter(x=>x).map(x=>x.trim());
        }
    }
});

async function getWikisourceJson(title, count, saveContent = {}) {
    if (!("numOfDir" in saveContent)) {
        saveContent.numOfDir = 0;
    }
    try {
        let apiBackJson = await axios.get(
            "https://zh.wikisource.org/w/api.php?format=json&action=query&prop=revisions&rvprop=content&utf8", {
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
        let cleanText = dirtyText.match(/.*\[\[(\/*.*)\|*.*\]\]/gm);
        cleanText = cleanText
            .join("\n")
            .replace(/^\n/gm, "")
            .replace(/^\n/gm, "");
        // console.log(cleanText)
        cleanText = cleanText.match(/^[*#!].*\[\[(.*)\|*.*\]\]/gm).join("\n");
        cleanText = cleanText
            .replace(/.*\[\[(.*\/*.*)\|*.*\]\]/gm, "$1")
            .replace(/\|.*/gm, "");
        // console.log(cleanText);
        let wikiArrayCut = cleanText.split("\n");
        saveContent.numOfDir += wikiArrayCut.length;
        for (let i = 0; i < wikiArrayCut.length; i++) {
            saveContent.numOfDir--;
            if (/^\/.*/.test(wikiArrayCut[i])) {
                wikiArrayCut[i] = wikiTitle + wikiArrayCut[i];
            }
            if (
                app.menuOfWiki.indexOf(wikiArrayCut[i]) == -1 &&
                !/.*全覽.*/.test(wikiArrayCut[i])
            ) {
                app.menuOfWiki.push({
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
            tableTreeGenerate(app.menuOfWiki);
        }
        // cleanText.split("\n").forEach(async (ele) => {
        //     if(/^\/.*/.test(ele)) {
        //         ele = wikiTitle + ele;
        //     }
        //     if(app.menuOfWiki.indexOf(ele)==-1 && !/.*全覽.*/.test(ele)) {
        //         await app.menuOfWiki.push(ele);
        //         await console.log(`這是第${count}層，title是${ele}\n`);
        //         await getWikisourceJson(ele, count+1, saveContent);
        //     }
        // })
    } catch (error) {
        console.log(error);
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
            let temp = level.find(({
                id
            }) => key === id);
            let isLeaf = true;
            if (!temp) {
                isLeaf = index === logArray.length - 1 ? true : false;
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
    app.menuOfWiki = result;
}

function treeIndexSort(resultTree, path = "", count = 1) {
    for (
        let iterTreeCount = 0; iterTreeCount < resultTree.length; iterTreeCount++
    ) {
        resultTree[iterTreeCount].index = count;
        resultTree[iterTreeCount].id =
            path === "" ?
            `${resultTree[iterTreeCount].label}` :
            `${path}/${resultTree[iterTreeCount].label}`;
        count++;
        if (!resultTree[iterTreeCount].isLeaf) {
            count = treeIndexSort(
                resultTree[iterTreeCount].children,
                resultTree[iterTreeCount].id,
                count
            );
        }
    }
    return count;
}

//TODO: 讓爬蟲得到的html可以附加屬性且與vue互動
//法一:用replace或是jquery的css把顏色加上去再放進v-html
//<div v-html="article.content" class="article--content"></div>
//可以在div中先指定一個樣式然後用深度選擇器去改變！
//https://happyjayxin.medium.com/%E5%A6%82%E4%BD%95%E6%94%B9%E8%AE%8A-vue-%E4%B8%AD-v-html-%E8%A3%A1%E9%9D%A2%E7%9A%84%E6%A8%A3%E5%BC%8F-9fcdf0c49130
//將乾淨的字從html拋出
/* function strip(html){
   let doc = new DOMParser().parseFromString(html, 'text/html');
   return doc.body.textContent || "";
}*/

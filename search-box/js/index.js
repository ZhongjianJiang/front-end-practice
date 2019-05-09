(function(window,document){
    //通用方法
    const methods = {
        $(selector, root = document){
            return root.querySelector(selector);
        },
        $$(selector, root = document){
            return root.querySelectorAll(selector);
        }
    };

    let Search = function (selector){
        this._init(selector);
        this._classified();
        this._bind();
    };
    //初始化
    Search.prototype._init = function(selector){
        this.wrap = methods.$(selector);
        this.types = [];
        this.classify = {};
        this.container = methods.$(".container",this.wrap);
        this.SearchBox = methods.$(".search-box",this.container);
        this.dropdown = methods.$(".dropdown",this.container);
        this.output = methods.$(".output",this.wrap);
        this.dropdownList = null;
        this.prevStr = "未选择";
        this.curStr = "未选择";
        this.prevVal = undefined;
        this.curVal = undefined;
        this.items = [];
        this.dropdown.setAttribute("data-active", "hide");
    };
    //选项分类
    Search.prototype._classified = function(){
        let list = methods.$(".dropdown-list",this.dropdown);
        let items = [...methods.$$(".dropdown-item",list)];
        items.forEach(item => {
            let type = item.getAttribute("type");
            if(!this.types.includes(type)){
                this.types.push(type);
            }
            if(!Object.keys(this.classify).includes(type)){
                this.classify[type] = [];
            }
            this.classify[type].push(item);
        });
        this._createSelect();
    };
    //重构select结构
    Search.prototype._createSelect = function(){
        this.dropdownList = methods.$(".dropdown-list",this.dropdown);
        let listContent ="";
        for(let type of this.types){
            listContent += `<option class="dropdown-type" value="type" disabled>${type}</option>`;
            this.classify[type].forEach(item => {
                listContent += item.outerHTML.toString();
            });
        }
        this.dropdownList.innerHTML = listContent;
    }
    //showHide dropdownSection
    Search.prototype._showHideDropdown = function(el){
        if(el.getAttribute("data-active") !== "show"){
            el.style.display = "block";
            el.setAttribute("data-active", "show");
        }else{
            el.style.display = "none";
            el.setAttribute("data-active", "hide");
        }
    };
    //隐藏模块
    Search.prototype._hide = function(el){
        el.style.display = "none";
    }
    //显示模块
    Search.prototype._show = function(el){
        el.style.display = "block";
    }
    //绑定事件
    Search.prototype._bind = function(){
        //窗口事件绑定
        window.addEventListener("click",(e) => {
            if(e.target.nodeName === "SELECT" || e.target.nodeName === "INPUT" || e.target === this.dropdown) return;
            if(this.dropdown.getAttribute("data-active") == "show"){
                this.dropdown.style.display = "none";
                this.dropdown.setAttribute("data-active", "hide");
            }
        })
        //结果输出框事件绑定
        this.SearchBox.addEventListener("click", ({target}) => {
            event.stopPropagation();
            if(target.nodeName !== "P" && target.nodeName !== "DIV" &&target.nodeName !== "IMG") return;
            this._showHideDropdown(this.dropdown);
        });
        //搜索输入框事件绑定
        methods.$(".dropdown-input",this.dropdown).addEventListener("input",(e)=>{
            let list = methods.$(".dropdown-list",this.dropdown);
            this.items = [...methods.$$(".dropdown-item",list)];
            let input = e.target.value;
            let regExp = new RegExp(input,"i");
        
            this.items.forEach(item =>{
                if(!regExp.test(item.innerText) && input !== ""){
                    this._hide(item);
                }else{
                    this._show(item);
                };
            });
        });
        //下拉选项列表事件绑定
        this.dropdownList.addEventListener("click", (e) => {
            e.stopPropagation();
            if(e.target.nodeName !== "OPTION") return;
            this.prevStr = this.curStr;
            this.prevVal = this.curVal;
            this.curStr = e.target.innerText;
            this.curVal = e.target.getAttribute("value");

            let searchResult = methods.$(".search-result", this.SearchBox);
            searchResult.innerText = this.curStr;

            let content = `之前的值是 ${this.prevStr} - ${this.prevVal}<br/>改变后的值是 ${this.curStr} - ${this.curVal}`;
            let botOutput = methods.$(".content",this.output);
            botOutput.innerHTML = content; 
            //隐藏下拉菜单
            setTimeout(()=>{
                this.dropdown.style.display = "none";
                this.dropdown.setAttribute("data-active", "hide");
            },100);
           
        });
    };
    //挂载到页面上
    window.$Search = Search;

})(window,document);
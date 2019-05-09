//对图片进行分类
//初始化
//事件绑定
//挂到DOM元素上
(function(window,document){
    let canChange = true;
    let curPreviewImgIndex = 0;
    const methods = {
        appendChild(parent,...child){
            child.forEach(el => {
                parent.appendChild(el);
            })
        },
        $(selector,root=document){
            return root.querySelector(selector);
        },
        $$(selector,root=document){
            return root.querySelectorAll(selector);
        }
    }
    let Img = function(options){
        this._init(options);
        this._createElement();
        this._bind();
        this._show();
    }
    //初始化
    Img.prototype._init = function({data,initType,parasitifer}){
        this.types = ["全部"]; //所有的分类
        this.all = []; //所有图片元素
        this.classified = {"全部":[]}; //按照类型分类后的图片
        this.curType = initType;//当前显示的图片分类
        this.parasitifer = methods.$(parasitifer);//挂载点

        this.wrap = null;//整体容器
        this.imgContainer = null;//图片容器
        this.typesBtnEls = null; //所有类型按钮的数组
        this.figures = null;//所有图片元素的数组

        this._classify(data);
        // console.log(this.classified);
        // console.log(this.all);
    };
    //图片分类
    Img.prototype._classify= function(data){
        let srcs = [];  

        data.forEach(({type, title, src, alt}) => {
            if(!this.types.includes(type)){
                this.types.push(type);
            }
            if(!Object.keys(this.classified).includes(type)){
                this.classified[type] = [];
            }

            if(!srcs.includes(src)){
                //如果没有图片
                //生成图片元素
                //加到All数组中去
                srcs.push(src);

                let figure = document.createElement("figure");
                let img = document.createElement("img");
                let figcaption = document.createElement("figcaption");

                img.src = src;
                img.setAttribute("alt",alt);
                figcaption.innerText = title;

                methods.appendChild(figure,img,figcaption);

                
                this.all.push(figure);
                this.classified[type].push(this.all.length - 1); 

            }else{
                //如果有图片
                //去All 中寻找图片元素
                this.classified[type].push(srcs.findIndex(s1 => s1 === src ));
            }
        })
    };
    //根据分类获取图片元素
    Img.prototype._getImgsByType = function(type){
        return type === "全部"? [...this.all] : this.classified[type].map(index => this.all[index]);
    }
    //创建DOM元素
    Img.prototype._createElement = function(){
        let typesBtn = [];

        for(let type of this.types.values()){
            typesBtn.push(
                `<li class="__Img__classify__type-btn ${type === this.curType? " __Img__type-btn-active" : ""}">${type}</li>`
            )
        }
        let template = `
        <ul class="__Img__classify">${typesBtn.join('')}</ul>
        <div class="__Img__img-container"></div>
        `;

        let wrap = document.createElement('div');
        wrap.className = "__Img__container";
        wrap.innerHTML = template;
        this.imgContainer = methods.$(".__Img__img-container",wrap);

        this.wrap = wrap;
        methods.appendChild(this.imgContainer,...this._getImgsByType(this.curType));
        
        this.typesBtnEls = [...methods.$$(".__Img__classify__type-btn",wrap)];
        this.figures = [...methods.$$("figure",wrap)];

        //遮罩层
        let overlay = document.createElement('div');
        overlay.className = "__Img__overlay";
        overlay.innerHTML = `
        <div class="__Img__overlay-prev-btn"></div>
        <div class="__Img__overlay-next-btn"></div>
        <img src="" alt="">
        `
        methods.appendChild(this.wrap,overlay);
        this.overlay = overlay;
        this.perviewImg = methods.$("img",overlay);

    };
    //不同类型相同图片的映射关系
    Img.prototype._diff = function(prevImgs, nextImgs){
        let diffArr = [];
        prevImgs.forEach((src1,index1) => {
            let index2 = nextImgs.findIndex(src2 => src2 == src1);
            if(index2 !== -1){  
                diffArr.push([index1,index2]);
            }
        })
        return diffArr;
    };
    //绑定事件
    Img.prototype._bind = function(){

        let ul = methods.$(".__Img__classify", this.wrap);
        ul.addEventListener("click", ({target}) => {
            if(target.nodeName !== "LI") return;
            if(!canChange) return;
            canChange = false;
            const type = target.innerText;
            const els = this._getImgsByType(type);

            let prevImgs = this.figures.map(figure => methods.$("img",figure).src);
            let nextImgs = els.map(figure => methods.$("img",figure).src);

            let diffArr = this._diff(prevImgs, nextImgs);
            
            diffArr.forEach(([,i2]) => {
                this.figures.every((figure,index) =>{
                    let src = methods.$("img",figure).src;

                    if(src === nextImgs[i2]){
                        this.figures.splice(index,1);
                        return false;
                    }
                    return true;
                });
            });

            this._calPosition(els);
            
            let needAppendEls = [];
            if(diffArr.length){
                let needElsIndex = diffArr.map(([,i2]) => i2);
                els.forEach((figure,index) => {
                    if(!needElsIndex.includes(index)){
                        needAppendEls.push(figure);
                    }
                })
            }else{
                needAppendEls = els;
            }
            this.figures.forEach(el => {
                el.style.transform = "scale(0,0) tanslate(0,100%)";
                el.style.opacity = "1";
            });
            methods.appendChild(this.imgContainer,...needAppendEls);

            setTimeout(()=>{
                els.forEach(figure => {
                    figure.style.transform = "scale(1,1) translate(0,0)";
                    figure.style.opacity = "1";
                })
            });

            setTimeout(()=>{
                this.figures.forEach(figure =>{
                    this.imgContainer.removeChild(figure);
                })
                this.figures = els;
                canChange = true;
            },600)

            this.typesBtnEls.forEach(btn => {
                btn.className = "__Img__classify__type-btn";
            })
            target.className = "__Img__classify__type-btn __Img__type-btn-active";
        });

        this.imgContainer.addEventListener("click",({target}) => {
            if(target.nodeName !== "FIGURE" && target.nodeName !== "FIGCAPTION") return;
            if(target.nodeName === "FIGCAPTION"){
                target = target.parentNode;
            }
            let src = methods.$("img",target).src;
            this.perviewImg.src = src;
            curPreviewImgIndex = this.figures.findIndex(figure => methods.$("img",figure).src === src);
            console.log(curPreviewImgIndex);
            this.overlay.style.display = "flex";
            setTimeout(() =>{
                this.overlay.style.opacity = "1";
            });
        });

        this.overlay.addEventListener("click",()=>{
            this.overlay.style.opacity = "0";
                setTimeout(() => {
                    this.overlay.style.display = "none"; 
                },300)
        });
        methods.$(".__Img__overlay-prev-btn",this.overlay).addEventListener("click", e =>{
            e.stopPropagation();
            curPreviewImgIndex = curPreviewImgIndex === 0? this.figures.length - 1:curPreviewImgIndex - 1;
            this.perviewImg.src = methods.$("img",this.figures[curPreviewImgIndex]).src; 
        });
        methods.$(".__Img__overlay-next-btn",this.overlay).addEventListener("click", e =>{
            e.stopPropagation();
            curPreviewImgIndex = curPreviewImgIndex === this.figures.length - 1? 0 :curPreviewImgIndex + 1;
            this.perviewImg.src = methods.$("img",this.figures[curPreviewImgIndex]).src; 
        });
    };
    //计算坐标
    Img.prototype._calPosition = function(figures){
        let horizontalIndex = 0;

        figures.forEach((figure,index) => {
            figure.style.top = parseInt(index/4) * 140 + parseInt(index/4) * 15 + "px";
            figure.style.left = horizontalIndex * 240 + horizontalIndex * 15 + "px";
            figure.style.transform = "scale(0,0) translate(0,100%)";
            horizontalIndex = (horizontalIndex+1)%4;
        })
        let len = figures.length;
        this.imgContainer.style.height = Math.ceil(len/4) * 140 + (Math.floor(len/4)-1)*15 + "px";
    };
    //显示内容
    Img.prototype._show = function(){
        methods.appendChild(this.parasitifer, this.wrap);

        setTimeout(() => {
            this.figures.forEach(figure => {
                figure.style.transform = "scale(1,1) translate(0,0)";
                figure.style.opacity = "1";
            })
        },500)

        this._calPosition(this.figures);
    };

    window.$Img = Img;
})(window,document);
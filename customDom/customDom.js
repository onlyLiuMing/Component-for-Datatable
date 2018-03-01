/****
 * 这里参考dastatable-buttons组件，写了一个  ‘自定义dom’  的组件，因为只参考了单一组件，在设计上可能会有偏差，如有更好的方式，可以直接修改本文件（请做好注释哦！！）
 * 此组件仅提供了一个datatable中放置自定义元素的容器，内部的样式仍需自己定义（大家都是开发者，给点自由度比较好嘛，其实我写不出来了）
 * 
 * 在初始配置中请在dom中添加 ‘D’ 选项
 * 在初始配置中请添加customDom：{}选项
 * 
 * datatable中的配置
 *     {
 *        customDom:{
               wrapper:{
                    tag:'div',
                    className:'row',
                    id:'',
                    show:'true',
                    style:'display:none;width:12px'
               },
               content:''   //这里可以直接填一个dom的字符串，也可以写一个jquery的选择器（选择器模式会找到对应元素，并截取到设置的目标位置，注意---会删除原来的元素） 
 *        },
 *        dom:'BDltfs'  //这里的dom参数是必须的'D'
 *     }

   'customDom'插件API
          显示    $('table:eq(0)').DataTable().customDom.show(); 
          隐藏    $('table:eq(0)').DataTable().customDom.hide();
          清空    $('table:eq(0)').DataTable().customDom.empty();
          替换    $('table:eq(0)').DataTable().customDom.replace( content );      // 'content' 格式可以是 “<div>内容</div>” 或者 $('<div>内容</div>') 或者 jquery选择器

 * ******/
(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		module.exports = function (root, $) {
			if ( ! root ) {
				root = window;
			}

			if ( ! $ || ! $.fn.dataTable ) {
				$ = require('datatables.net')(root, $).$;
			}

			return factory( $, root, root.document );
		};
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function($,window,document,undefind){
  //传入的自定义函数
  var DataTable = $.fn.dataTable;

  // Used for namespacing events added to the document by each instance, so they
  // can be removed on destroy
  var _instCounter = 0;

  // Button namespacing counter for namespacing events on individual buttons
  var _DomCounter = 0;

  var _dtDom = DataTable.ext.dom;

  //实例化对象原型
  var CustomDom = function(dt,config){
    // If there is no config set it to an empty object
	  if ( typeof( config ) === 'undefined' ) {
	  	config = {};	
	  }
	
	  // Allow a boolean true for defaults
	  if ( config === true ) {
	  	config = {};
	  }

    //全局放置的静态内容
	  this.STORE = {
	  	dt: new DataTable.Api( dt ),
    };

    //set global const CONFIG 
    this.CONFIG = CustomDom.formatConfig(dt,config);

    // console.log(this.CONFIG );

    this.DOM = {
      container:$('<' + this.CONFIG.wrapper.tag + '>')
                  .addClass(this.CONFIG.wrapper.className)
                  .attr('id',this.CONFIG.wrapper.id)
    }
  }

  /***** 给实例化函数添加初始函数，用以内部调用 *****/
  $.extend(CustomDom.prototype,{
    init(){
      var that = this;
      var _dt = this.STORE.dt;
      var _dt_setting = _dt.settings()[0];
      var _option = this.CONFIG;
      var _wrapper = $.extend(true,{},this.DOM.container);

      //set container's content
      if(_option.content && (_option.content.jquery || typeof _option.content === 'string')){
        $(_option.content).appendTo(_wrapper);
      }else if(_option.content){
        console.warn('未填入customDom内容');
      }else{
        console.warn('customDom格式出错');
      }

      //set container show or hide
      if(!_option.wrapper.show){
        _wrapper.hide();
      }

      //set container's style
      if(_option.wrapper.style){
        _wrapper.css(_option.wrapper.style);
      }

      return _wrapper;
    },
    _constructor(){
      return this.init();
    }
  })

  /***** 添加到当前customDom上的函数,用以调用 *****/
  CustomDom.version = '1.0.0';
  //默认配置
  CustomDom.defaults = {
    wrapper:{
      tag:'div',
      className:'row',
      id:'',
      show:'true',
      style:''
    },
    content:''
  }

  //formatConfig    处理默认config
  CustomDom.formatConfig = function(dt,config ){
    var _dt_api = new DataTable.Api(dt); 
    var _option = $.extend(true,{},CustomDom.defaults,config); 

    // console.log(config );
    _option.wrapper.id = _dt_api.settings()[0].sTableId + '_CustomDom';

    if( _option.wrapper.style && typeof _option.wrapper.style === 'string'){
      var _store = _option.wrapper.style.split(';').filter(function(item){return !!item});
      _option.wrapper.style = {};

      for(var i = _store.length-1;i>=0;i--){
        var temp = _store[i].split(':');
        _option.wrapper.style[temp[0]] = temp[1];
      }
    }

    return _option;
  }

  /***** 添加Datatable.api中的方法 *****/
  DataTable.Api.register('customDom()',function(group,select){
    return this;
  });
  //show
  DataTable.Api.register('customDom.show()',function(){
    var CustomDom_wrapper = $("#" + this.table().container().id.slice(0,this.table().container().id.lastIndexOf('_')+1) + 'CustomDom');
    CustomDom_wrapper.slideDown();

    return this
  });
  // hide
  DataTable.Api.register('customDom.hide()',function(){
    var CustomDom_wrapper = $("#" + this.table().container().id.slice(0,this.table().container().id.lastIndexOf('_')+1) + 'CustomDom');
    CustomDom_wrapper.slideUp();

    return this
  });
  // clear
  DataTable.Api.register('customDom.clear()',function(){
    var CustomDom_wrapper = $("#" + this.table().container().id.slice(0,this.table().container().id.lastIndexOf('_')+1) + 'CustomDom');
    CustomDom_wrapper.empty().hide();

    return this
  }); 
  // replace
  DataTable.Api.register('customDom.replace()',function(content){
    var CustomDom_wrapper = $("#" + this.table().container().id.slice(0,this.table().container().id.lastIndexOf('_')+1) + 'CustomDom');
    var Content = $(content);// content的格式可以是 “<div>内容</div>” 或者 $('<div>内容</div>') 或者 jquery选择器
    CustomDom_wrapper.html(Content).slideDown();

    return this
  });

  $.fn.dataTable.CustomDom = CustomDom;
  $.fn.DataTable.CustomDom = CustomDom;

  // DataTables creation - check if the buttons have been defined for this table,
  // they will have been if the `B` option was used in `dom`, otherwise we should
  // create the buttons instance here so they can be inserted into the document
  // using the API. Listen for `init` for compatibility with pre 1.10.10, but to
  // be removed in future.
  $(document).on( 'init.dt plugin-init.dt', function (e, settings) {
  	if ( e.namespace !== 'dt' ) {
  		return;
  	}

  	var opts = settings.oInit.buttons || DataTable.defaults.buttons;

  	if ( opts && ! settings._buttons ) {
  		new CustomDom( settings, opts )._constructor();
  	}
  } );


  //嵌入到DATATABLE的dom排布中
  DataTable.ext.feature.push( {
    fnInit: function( settings ) {
      var api = new DataTable.Api( settings );
      var opts = api.init().customDom || DataTable.defaults.customDom;
  
      return new CustomDom( api, opts )._constructor();
    },
    cFeature: "D"
  } );
}))
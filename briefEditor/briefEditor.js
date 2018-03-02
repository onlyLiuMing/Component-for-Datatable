/****
 * 由于datatable-editor组件是收费的，身为天朝怎么能容忍这种事情发生，虽然我是个码农小白，但是为了良（zhi）好（zhang）的风气，必须撸出来一个！！！！
 * 这里的对于没有高要求的应该直接在datatable.js引入之后引入就可生效，如果需要做兼容性啥的，那大家参考一下就好了，因为我根本没写（其实是不会）
 * 
 * 这里参考dastatable-responsive组件，写了一个  ‘简洁版editor’  的组件，因为只参考了单一组件，在设计上可能会有偏差，如有更好的方式，可以直接修改本文件（请做好注释哦！！）
 * datatable中的配置：
				columns:[
          				  {data:'name',editor:true},//这里的editor必须为true才能进行编辑
          				  {data:'age',editor:true},
          				  {data:'sex',editor:true},
          			],
 * 				editor:{
 * 				  editor:true,
 * 					 focusStyle:'className',      //这里写className 
 * 					 finishCallback: function(cellType,el,dt){,  
 * 					 		这里的callback是 '完成' 按钮进行的操作，此时还没有将input中的值赋给td
 * 							cellType（当前单元格的数据类型）
 * 							el（当前td元素）  
 * 							dt（当前datatable的API） 
 * 							通过返回true、false来确定是否赋值给td(主要是用于数据验证)
 * 					 }
 * 				}
 * 
 * 如有需要需要自定义：
 * 			1.focusStyle中传入的className的样式，或者使用默认的 .dt-editor-active 样式（默认样式也需要单独写，你可以写两种样式切换着用，其实是我懒得从项目中找了 ）
 * 			2.需要自己写四个css样式(主要是我比较懒，由于大家需求不太一样，大家自己写好了,哎嘿嘿)
 * 						.dt-editor-active
 * 						.dt-editor-hook
 * 						.dt-editor-input
 * 						.dt-editor-btn
 * 			2.嵌套结构
 * 					<td class='.dt-editor-active'>
 * 						<div class='dt-editor-hook'>
 * 							<input type='text' class='dt-editor-input'/>
 * 							<button class='dt-editor-btn'>完成</button>
 * 						</div>			
 * 					</td>
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
  DataTable.SuccinctEditor = {};

  DataTable.SuccinctEditor.version = '1.0.0';

	//初始化函数 init
  DataTable.SuccinctEditor.init = function(dt){
		var ctx = dt.settings()[0].oInit;
		var Table = dt.table().node();
		var Api = dt;
		var editorList = DataTable.SuccinctEditor._editorAbleList(ctx.columns);

		var _default = {
			table:Table,// 当前table元素
			dtApi:Api,//当前table的datatable的API
			editorList:editorList,//允许编辑的 单元格类型 的列表
			focus_className:ctx.editor.focusStyle?ctx.editor.focusStyle : 'dt-editor-active',//可编辑单元格hover后的className标记
			replace_html:DataTable.SuccinctEditor._replaceHtml,//编辑时的html模板
			finishCallback:	ctx.editor.finishCallback? eval(ctx.editor.finishCallback) : null, // ‘完成’按钮的回调函数，通过return true（false）来判断是否赋值给td（是否成功修改，用于后台数据监测）
		}

		DataTable.SuccinctEditor._mountEvent(_default);	
	}


	/************************************* 内部调用函数 **********************************/
	// 产生html模板		replaceHtml
	DataTable.SuccinctEditor._replaceHtml = function(option){
			var data = {
				value:'',
			};

			$.extend(data,option);

			var template = `
				<div class='dt-editor-hook'>
						<input class='dt-input-hook' type='text' value='${data.value}' ><button class='dt-btn-hook'>完成</button>
				</div>
			`;

			return $(template);
	}

	// 挂载事件 mountEvent
	DataTable.SuccinctEditor._mountEvent = function(Option){
			var _table = Option.table;
			var _api = 	Option.dtApi;
			var _list = Option.editorList;
			var _finishCallback = Option.finishCallback;

			var tBody = $(_table).find('tbody');
			//挂载到tbody上的事件
			$(tBody).on('mouseover','td',function(){
				var cellType = _api.columns($(this)).dataSrc()[0]; 

				if(_list[cellType]){
					$(this).addClass(Option.focus_className)
				}
			});
		
			$(tBody).on('mouseout','td',function(){
				var cellType = _api.columns($(this)).dataSrc()[0]; 

				if(_list[cellType]){
					$(this).removeClass(Option.focus_className)
				}
			});
		
			$(tBody).on('dblclick','td',function(even){
				var cellType = _api.columns($(this)).dataSrc()[0]; 

				if(_list[cellType]){
					//检测编辑开关
					var option = {
						value:$(this).text()
					};
					var template = Option.replace_html(option);
				
					// console.log($(this).hasClass('editorAble'));
					if(!$(this).hasClass('editorAble')){
						$(this).html(template);
						$(this).find('input').focus();
					}
				
					$(this).addClass('editorAble');
				}
			})

			$(tBody).on('click','td .dt-btn-hook',function(){
				//1.将input中的值取出
				//2.将td上的editorAble标记去掉
				var wrapper = $(this).parents('td');
				var input = wrapper.find('.dt-input-hook');
				var cellType = _api.columns(wrapper).dataSrc()[0];
				var value = input.val();

				//触发完成的回调函数
				if(_finishCallback){
					var tag = (_finishCallback(cellType,wrapper,_api) === undefind || _finishCallback(wrapper,_api) )? true : false;
					// console.log(tag );
					if(tag){
						//如果返回值为false时，则不执行提交
						wrapper.empty();//貌似这样可以删除子元素上的listener event的实例（gc会自动回收）
						wrapper.html(value)
										.removeClass('editorAble');		
					}
				}else{
					wrapper.empty();//貌似这样可以删除子元素上的listener event的实例（gc会自动回收）
					wrapper.html(value)
									.removeClass('editorAble');	
				}
			})
		}

		// 返回可以编辑的列表 _editorAbleList
		DataTable.SuccinctEditor._editorAbleList = function(option){
			var DisposeList = option;
			var OutputList = {}

			for(var data of DisposeList){
				if(typeof data.editor === 'boolean'){
					OutputList[data.data] = data.editor;
				}else{
					OutputList[data.data] = false;
				}
			}
			// console.log(OutputList);
			return OutputList;
		}
	/************************************* end of 内部调用函数 ********************************/


  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   * Initialisation
   */

  // DataTables creation - check if select has been defined in the options. Note
  // this required that the table be in the document! If it isn't then something
  // needs to trigger this method unfortunately. The next major release of
  // DataTables will rework the events and address this.
  $(document).on( 'preInit.dt.dtSuccinctEdior', function (e, ctx) {
  	if ( e.namespace !== 'dt' ) {
  		return;
		}
		if(ctx.oInit.editor.editor){
  		DataTable.SuccinctEditor.init( new DataTable.Api( ctx ) );
		}
  } );
  
  
  return DataTable.SuccinctEditor;
}));

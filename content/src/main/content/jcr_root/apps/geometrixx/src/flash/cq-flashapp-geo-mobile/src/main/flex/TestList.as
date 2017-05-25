package {
	import mx.core.DragSource;
	
	import spark.components.List;
	
	public class TestList extends List {
		public function TestList() {
			super();
		}
		
		override public function addDragData(dragSource:DragSource):void
		{
			// TODO Auto Generated method stub
			super.addDragData(dragSource);
			
			var itemsVector:Vector.<Object> = dragSource.dataForFormat('itemsByIndex') as Vector.<Object>;
			var data:Object = itemsVector[0].data;
			
			dragSource.addData(data.obj, data.format);
		}
		
		
	}
}
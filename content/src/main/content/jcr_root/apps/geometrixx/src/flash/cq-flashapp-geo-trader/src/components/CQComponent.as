package components {
	
	import com.adobe.jcr.Node;
	
	import mx.core.IVisualElement;
	
	public interface CQComponent extends IVisualElement {
		
		function loadContent(node:Node):void;
		
	}
} 
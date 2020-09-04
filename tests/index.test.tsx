import { mount, configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import React from "react";

configure({ adapter: new Adapter() });

test("test1", () => {
	function Hello() {
		return <span>hello</span>;
	}
	const wrapper = mount(<Hello></Hello>);
	expect(wrapper.text()).toEqual("hello");
});

import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import GameEngine from "@/components/GameEngine.vue";

describe("GameEngine.vue", () => {
  it("renders props.msg when passed", () => {
    const msg = "new message";
    const wrapper = shallowMount(GameEngine, {
      propsData: { msg },
    });
    expect(wrapper.text()).to.include(msg);
  });
});

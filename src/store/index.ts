import MonsterIndexEditorRepository from "@/editors/monster-index/MonsterIndexEditorRepository";
import MonsterIndex from "@/game-engine/monster/MonsterIndex";
import Container from "typedi";
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    gameMode: true,
    monsterIndexEditor: Container.get<MonsterIndexEditorRepository>(
      MonsterIndexEditorRepository
    ).load(),
  },
  mutations: {
    setGameMode(state: any, gameMode: boolean) {
      state.gameMode = gameMode;
    },
    setMonsterIndexEditor(
      state: any,
      monsterIndexEditor: MonsterIndex[]
    ): void {
      const index = monsterIndexEditor.map((m) => m.clone());
      const repo = Container.get<MonsterIndexEditorRepository>(
        MonsterIndexEditorRepository
      );
      repo.save(index);
      state.monsterIndexEditor = index;
    },
  },
  actions: {},
  modules: {},
});

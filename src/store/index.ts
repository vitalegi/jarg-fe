import MonsterIndexEditorRepository from "@/editors/monster-index/MonsterIndexEditorRepository";
import { MonsterIndex } from "@/models/Character";
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
      state.monsterIndexEditor = monsterIndexEditor.map((m) => m.clone());
      const repo = Container.get<MonsterIndexEditorRepository>(
        MonsterIndexEditorRepository
      );
      repo.save(monsterIndexEditor);
    },
  },
  actions: {},
  modules: {},
});

import AbilityEditorRepository from "@/editors/ability/AbilityEditorRepository";
import MonsterIndexEditorRepository from "@/editors/monster-index/MonsterIndexEditorRepository";
import Ability from "@/game-engine/monster-action/Ability";
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
    abilitiesEditor: Container.get<AbilityEditorRepository>(
      AbilityEditorRepository
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
    setAbilitiesEditor(state: any, abilities: Ability[]): void {
      const repo = Container.get<AbilityEditorRepository>(
        AbilityEditorRepository
      );
      repo.save(abilities);
      state.abilitiesEditor = abilities;
    },
  },
  actions: {},
  modules: {},
});

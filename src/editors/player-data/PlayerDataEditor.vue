<template>
  <v-container>
    <v-row>
      <v-col xs="12" sm="12" md="6" lg="6" cols="6">
        <v-btn @click="save()">Save</v-btn>
      </v-col>
      <v-col xs="12" sm="12" md="6" lg="6" cols="6">
        <v-btn @click="addMonster()">Add Monster</v-btn>
      </v-col>
      <v-col xs="12" sm="12" md="6" lg="6" cols="6">
        <EditableIntegerField
          label="Last Tower Level"
          :value="playerData.lastDefeatedTowerMap"
          @change="changeLastDefeatedTowerMap"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col xs="12" sm="12" md="12" lg="6">
        <CompletedStoryMapsEditor
          :completedMaps="playerData.defeatedMaps"
          @change="changeDefeatedMaps"
        />
      </v-col>
      <v-col xs="12" sm="12" md="12" lg="6">
        <OwnedMonstersEditor
          :monsters="playerData.monsters"
          @change="changeMonsters"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import LoggerFactory from "@/logger/LoggerFactory";
import PlayerData from "@/game-engine/model/player-data/PlayerData";
import UuidUtil from "@/utils/UuidUtil";
import EditableIntegerField from "@/components/EditableIntegerField.vue";
import CompletedStoryMapsEditor from "@/editors/player-data/CompletedStoryMapsEditor.vue";
import OwnedMonstersEditor from "@/editors/player-data/OwnedMonstersEditor.vue";
import MonsterData from "@/game-engine/model/monster/MonsterData";
import Move from "@/models/Move";
import { CharacterType } from "@/models/Character";
import Container from "typedi";
import GameAssetService from "@/services/GameAssetService";
import MonsterIndexRepository from "@/game-engine/repositories/MonsterIndexRepository";

export default Vue.extend({
  name: "PlayerDataEditor",
  components: {
    EditableIntegerField,
    CompletedStoryMapsEditor,
    OwnedMonstersEditor,
  },
  props: {
    playerData: PlayerData,
  },
  data: () => ({
    logger: LoggerFactory.getLogger("Editors.PlayerData.PlayerDataEditor"),
  }),
  computed: {
    exportJson(): string {
      return "";
    },
  },
  methods: {
    generateNewUUID(): void {
      this.update((data) => {
        data.playerId = UuidUtil.nextId();
        data.monsters.forEach((m) => (m.ownerId = data.playerId));
      });
    },
    changeLastDefeatedTowerMap(value: number): void {
      this.logger.info(`changeLastDefeatedTowerMap ${value}`);
      this.update((data) => {
        data.lastDefeatedTowerMap = value;
      });
    },
    changeDefeatedMaps(mapIds: string[]): void {
      this.logger.info(`change completed maps ${mapIds}`);
      this.update((data) => {
        data.defeatedMaps = mapIds;
      });
    },
    addMonster(): void {
      this.logger.info(`add monster`);
      const monsterIndexRepository = Container.get(MonsterIndexRepository);
      const indexes = monsterIndexRepository.getMonsters();

      const monster = new MonsterData();
      monster.uuid = UuidUtil.nextId();
      const ref = indexes[Math.floor(Math.random() * indexes.length)];
      monster.modelId = ref.monsterId;
      monster.level = Math.ceil(100 * Math.random());
      monster.name = ref.name;

      monster.ownerId = this.playerData.playerId;

      const movements = new Move();
      movements.steps = 3;
      movements.canWalk = true;
      monster.movements = movements;

      monster.hp = null;
      monster.type = CharacterType.MONSTER;

      const monsters = this.playerData.monsters.map((m) => m);
      monsters.push(monster);
      this.update((data) => (data.monsters = monsters));
    },
    changeMonsters(monsters: MonsterData[]): void {
      this.logger.info(`change monsters`);
      this.update((data) => {
        data.monsters = monsters;
      });
    },
    update(fn: (data: PlayerData) => void): void {
      const out = PlayerData.fromJson(this.playerData.toJson());
      fn(out);
      this.$emit("change", out);
    },
    save(): void {
      this.$emit("save");
    },
  },
  mounted(): void {
    const gameAssetService = Container.get(GameAssetService);
    const monsterIndexRepository = Container.get(MonsterIndexRepository);
    gameAssetService.getMonstersData().then((monsters) => {
      this.logger.info(`Monsters are loaded`);
      monsterIndexRepository.init(monsters);
    });
  },
});
</script>

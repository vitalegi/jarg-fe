<template>
  <v-simple-table dense>
    <thead>
      <tr>
        <th>Delete</th>
        <th>Name</th>
        <th>Level</th>
        <th>ModelID</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="monster in getMonsters()" :key="monster.uuid">
        <td>
          <v-btn icon @click="removeMonster(monster.uuid)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </td>
        <td>
          <EditableTextField
            :value="monster.name"
            @change="(e) => changeName(monster.uuid, e)"
          />
        </td>
        <td>
          <EditableIntegerField
            :value="monster.level"
            @change="(e) => changeLevel(monster.uuid, e)"
          />
        </td>
        <td>
          <EditableTextField
            :value="monster.modelId"
            @change="(e) => changeModelId(monster.uuid, e)"
          />
        </td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<script lang="ts">
import Vue from "vue";
import LoggerFactory from "@/logger/LoggerFactory";
import MonsterData from "@/game-engine/model/monster/MonsterData";
import EditableTextField from "@/components/EditableTextField.vue";
import EditableIntegerField from "@/components/EditableIntegerField.vue";
import Container from "typedi";
import MonsterIndexRepository from "@/game-engine/repositories/MonsterIndexRepository";
import GameAssetService from "@/services/GameAssetService";

export default Vue.extend({
  name: "OwnedMonstersEditor",
  props: {
    monsters: Array,
  },
  components: { EditableTextField, EditableIntegerField },
  data: () => ({
    logger: LoggerFactory.getLogger("Editors.PlayerData.OwnedMonstersEditor"),
    monsterIndexRepository: Container.get(MonsterIndexRepository),
  }),
  methods: {
    getMonsters(): MonsterData[] {
      return this.monsters as MonsterData[];
    },
    changeName(uuid: string, value: string): void {
      this.logger.info(`change name of ${uuid} to ${value}`);
      this.update(uuid, (data) => {
        data.name = value;
      });
    },
    changeLevel(uuid: string, value: number): void {
      this.logger.info(`change level of ${uuid} to ${value}`);
      this.update(uuid, (data) => {
        data.level = value;
      });
    },
    changeModelId(uuid: string, value: string): void {
      this.logger.info(`change name of ${uuid} to ${value}`);
      this.update(uuid, (data) => {
        data.modelId = value;
        data.name = this.getMonsterDefaultName(value);
      });
    },
    getMonsterDefaultName(modelId: string): string {
      try {
        const monster = this.monsterIndexRepository.getMonster(modelId);
        return monster.name;
      } catch (e) {
        this.logger.error(`Invalid modelId ${modelId}`, e);
        return "";
      }
    },
    removeMonster(uuid: string): void {
      this.logger.info(`Remove monster ${uuid}`);
      const out = this.getMonsters()
        .filter((m) => m.uuid !== uuid)
        .map((m) => m.clone());
      this.$emit("change", out);
    },
    update(uuid: string, fn: (data: MonsterData) => void): void {
      const out = this.getMonsters().map((m) => m.clone());
      out.filter((m) => m.uuid === uuid).forEach((m) => fn(m));
      this.$emit("change", out);
    },
  },
});
</script>

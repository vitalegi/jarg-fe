<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <PlayerDataEditor
          :playerData="playerData"
          @change="update"
          @save="save"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import PlayerDataEditor from "@/editors/player-data/PlayerDataEditor.vue";
import PlayerData from "@/game-engine/model/player-data/PlayerData";
import LoggerFactory from "@/logger/LoggerFactory";
import UuidUtil from "@/utils/UuidUtil";
import Container from "typedi";
import PlayerRepository from "@/game-engine/repositories/PlayerRepository";
export default Vue.extend({
  name: "PlayerDataEditorView",

  components: {
    PlayerDataEditor,
  },
  data: () => ({
    logger: LoggerFactory.getLogger("Views.PlayerDataEditorView"),
    playerData: new PlayerData(),
  }),
  methods: {
    update(newPlayerData: PlayerData): void {
      this.logger.info(`Update player data`);
      this.playerData = newPlayerData;
    },
    save(): void {
      const playerRepository = Container.get(PlayerRepository);
      playerRepository.save(this.playerData);
    },
  },
  mounted(): void {
    this.playerData.playerId = UuidUtil.nextId();
  },
});
</script>

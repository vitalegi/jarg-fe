<template>
  <v-container>
    <v-row>
      <v-col style="text-align: right">
        <ImportDialog
          title="Import monsters"
          :initialValue="exportJson"
          @change="importJson"
        />
        <MonstersIndexAbilitiesImport @select="massiveAddAbilities" />
        <CopyToClipboardBtn :value="exportJson" />
      </v-col>
    </v-row>
    <v-row>
      <MonsterIndexSearch :monsters="monsters" v-slot="slotProps">
        <v-row>
          <v-col
            v-for="item in slotProps.items"
            :key="item.monsterId"
            cols="12"
          >
            <MonsterIndexEditor
              :index="item"
              :expanded="slotProps.isExpanded(item)"
              :expand="slotProps.expand"
              :monsters="monsters"
              :abilities="storedAbilities"
              @change="updateIndex"
              @changeId="(e) => updateIndexId(e.oldId, e.newId)"
              @delete="deleteIndex"
            />
          </v-col>
        </v-row>
      </MonsterIndexSearch>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import MonsterIndexEditor from "./MonsterIndexEditor.vue";
import ImportDialog from "../../components/ImportDialog.vue";
import MonsterIndexSearch from "./MonsterIndexSearch.vue";
import MonstersIndexAbilitiesImport from "./MonstersIndexAbilitiesImport.vue";
import LoggerFactory from "@/logger/LoggerFactory";
import CopyToClipboardBtn from "@/components/CopyToClipboardBtn.vue";
import MonsterIndex from "@/game-engine/model/monster/MonsterIndex";

export default Vue.extend({
  name: "PlayerDataListEditor",
  components: {
    MonsterIndexEditor,
    ImportDialog,
    MonsterIndexSearch,
    MonstersIndexAbilitiesImport,
    CopyToClipboardBtn,
  },
  data: () => ({
    logger: LoggerFactory.getLogger("Editors.PlayerData.PlayerDataListEditor"),
    monsters: new Array<MonsterIndex>(),
  }),
  computed: {
    exportJson(): string {
      return "";
    },
  },
  methods: {},
});
</script>

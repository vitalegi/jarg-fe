<template>
  <v-container>
    <v-row>
      <v-col style="text-align: right">
        <ImportDialog
          title="Import abilities"
          :initialValue="exportJson"
          @change="importJson"
        />
        <v-btn icon color="primary" class="mx-2" @click="addAbility">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <CopyToClipboardBtn :value="exportJson" />
      </v-col>
    </v-row>
    <v-row>
      <AbilitySearch :abilities="getAbilities()" v-slot="slotProps">
        <v-row>
          <v-col
            v-for="item in slotProps.items"
            :key="item.abilityId"
            cols="12"
          >
            <AbilityEditor
              :ability="item"
              :expanded="slotProps.isExpanded(item)"
              :expand="slotProps.expand"
              @change="updateAbility"
              @changeId="(e) => updateId(e.oldId, e.newId)"
              @delete="(e) => deleteAbility(item.id)"
            ></AbilityEditor>
          </v-col>
        </v-row>
      </AbilitySearch>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import AbilityEditor from "@/editors/ability/AbilityEditor.vue";
import AbilitySearch from "@/editors/ability/AbilitySearch.vue";
import ImportDialog from "@/components/ImportDialog.vue";
import NumberUtil from "@/utils/NumberUtil";
import StringUtil from "@/utils/StringUtil";
import RechargeFamily from "@/game-engine/model/ability/RechargeFamily";
import CopyToClipboardBtn from "@/components/CopyToClipboardBtn.vue";
import Ability from "@/game-engine/model/ability/Ability";

export default Vue.extend({
  name: "AbilitiesEditor",
  components: {
    AbilityEditor,
    ImportDialog,
    AbilitySearch,
    CopyToClipboardBtn,
  },
  data: () => ({
    sortBy: "ID",
    sortOrderAsc: true,
    search: "",
  }),
  computed: {
    exportJson(): string {
      return JSON.stringify(
        this.getAbilities().map((a) => a.toJson()),
        undefined,
        4
      );
    },
  },
  methods: {
    getAbilities(): Ability[] {
      return this.$store.state.abilitiesEditor as Ability[];
    },
    addAbility(): void {
      const abilities = this.getAbilities().map((e) => e.clone());
      const ability = new Ability();

      const maxId = NumberUtil.max(
        this.getAbilities()
          .filter((a) => NumberUtil.isNumber(a.id))
          .map((a) => NumberUtil.parseAsInt(a.id))
      );
      ability.id = StringUtil.leftPad(`${maxId + 1}`, 3, "0");
      ability.rechargeFamily = RechargeFamily.DEFAULT_VALUE;
      abilities.push(ability);
      this.updateStorage(abilities);
    },
    updateAbility(ability: Ability): void {
      const abilities = this.getAbilities().map((e) => e.clone());
      const index = abilities.findIndex((e) => e.id === ability.id);
      if (index !== -1) {
        abilities[index] = ability;
      } else {
        abilities.push(ability);
      }
      this.updateStorage(abilities);
    },
    updateId(oldId: string, newId: string): void {
      const abilities = this.getAbilities().map((e) => e.clone());
      const oldIndex = abilities.findIndex((e) => e.id === oldId);
      if (oldIndex === -1) {
        throw Error(`Cannot find old entry ${oldId}.`);
      }
      const newIndex = abilities.findIndex((e) => e.id === newId);
      if (newIndex !== -1) {
        throw Error(`New Id ${newId} already in use.`);
      }
      abilities[oldIndex].id = newId;
      this.updateStorage(abilities);
    },
    deleteAbility(id: string): void {
      const abilities = this.getAbilities()
        .map((e) => e.clone())
        .filter((e) => e.id !== id);

      this.updateStorage(abilities);
    },
    importJson(json: string): void {
      const list = JSON.parse(json);
      const abilities = list.map(Ability.fromJson);
      this.updateStorage(abilities);
    },
    updateStorage(abilities: Ability[]) {
      this.$store.commit("setAbilitiesEditor", abilities);
    },
  },
});
</script>

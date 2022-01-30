<template>
  <v-container>
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
          type="text"
          label="Search"
          @change="changeSearch"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import LoggerFactory from "@/logger/LoggerFactory";
import Vue from "vue";
import EncryptionUtil from "@/utils/EncryptionUtil";

export default Vue.extend({
  name: "Home",
  components: {},
  data: () => ({
    logger: LoggerFactory.getLogger("Views.Home"),
    search: "",
  }),
  methods: {
    async changeSearch(value: string): Promise<void> {
      // 10years
      const maxAge = 60 * 60 * 24 * 265 * 10;
      const secret = await EncryptionUtil.sha512(value);
      document.cookie = `secret=${secret}; path=/; max-age=${maxAge}; samesite`;
    },
  },
});
</script>

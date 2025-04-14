import { PersistBase, PersistEmbedding, setConfig } from "agent-swarm-kit";

setConfig({
  CC_PERSIST_ENABLED_BY_DEFAULT: false,
  CC_PERSIST_MEMORY_STORAGE: false,
  CC_STORAGE_DISABLE_GET_DATA: true,
});

PersistEmbedding.usePersistEmbeddingAdapter(
  class extends PersistBase {
    async waitForInit() {}
    async readValue() {
      throw new Error("Unimplemented method");
    }
    async hasValue() {
      return false;
    }
    async writeValue() {}
  }
);

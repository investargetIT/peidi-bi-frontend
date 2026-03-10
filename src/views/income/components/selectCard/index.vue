<script setup lang="ts">
import { ref } from "vue";

interface Option {
  key: string;
  label: string;
}

const props = defineProps<{
  options?: Option[];
  modelValue?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const defaultProps = {
  options: [
    { key: "growth", label: "同比增长" },
    { key: "ringGrowth", label: "环比增长" },
    { key: "all", label: "全部对比" }
  ]
};

const selectedOption = ref(props.modelValue || "growth");

const handleSelect = (optionKey: string) => {
  selectedOption.value = optionKey;
  emit("update:modelValue", optionKey);
};
</script>

<template>
  <div>
    <div class="peidi-select-card-container">
      <button
        v-for="option in props.options || defaultProps.options"
        :key="option.key"
        :class="[
          'peidi-select-btn',
          { 'peidi-is-selected': selectedOption === option.key }
        ]"
        @click="handleSelect(option.key)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.peidi-select-card-container {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
}

.peidi-select-btn {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #909399;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #606266;
  }

  &.peidi-is-selected {
    background-color: #2563eb;
    color: #fff;
    box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
  }
}
</style>

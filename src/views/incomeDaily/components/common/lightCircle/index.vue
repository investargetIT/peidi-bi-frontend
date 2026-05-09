<script setup lang="ts">
const props = defineProps<{
  status: "success" | "danger" | null | undefined;
}>();

const getStatusClass = (status: "success" | "danger" | null | undefined) => {
  if (status === "success") {
    return "peidi-incomePro-lightCircle-status-green";
  } else if (status === "danger") {
    return "peidi-incomePro-lightCircle-status-red";
  }
  return "";
};
</script>

<template>
  <div class="peidi-incomePro-lightCircle-wrapper">
    <span
      class="peidi-incomePro-lightCircle-status-indicator inline-block h-2.5 w-2.5"
      :class="getStatusClass(props.status)"
    />
  </div>
</template>

<style lang="scss" scoped>
.peidi-incomePro-lightCircle-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  margin: -4px;
}

.peidi-incomePro-lightCircle-status-indicator {
  position: relative;
  border-radius: 50%;

  &::before {
    position: absolute;
    inset: -2px;
    content: "";
    background: inherit;
    border-radius: 50%;
    opacity: 0.3;
    filter: blur(3px);
  }
}

.peidi-incomePro-lightCircle-status-green {
  background: linear-gradient(135deg, #00c853, #009624);
  animation: 2s ease-in-out infinite glow-pulse-green;
}

@keyframes glow-pulse-green {
  0%,
  100% {
    box-shadow:
      0 0 4px 1px #009c2499,
      0 0 8px 2px #009c244d,
      inset 0 0 3px #7bd77f80;
  }

  50% {
    box-shadow:
      0 0 8px 3px #009c24cc,
      0 0 16px 6px #009c2466,
      inset 0 0 5px #b5f0b599;
  }
}

.peidi-incomePro-lightCircle-status-red {
  background: linear-gradient(135deg, #ff5252, #d50000);
  animation: 1.5s ease-in-out infinite glow-pulse-red;
}

@keyframes glow-pulse-red {
  0%,
  100% {
    box-shadow:
      0 0 4px 1px #d4092499,
      0 0 8px 2px #d409244d,
      inset 0 0 3px #ed756e80;
  }

  50% {
    box-shadow:
      0 0 8px 3px #d40924cc,
      0 0 16px 6px #d4092466,
      inset 0 0 5px #f8a49d99;
  }
}
</style>

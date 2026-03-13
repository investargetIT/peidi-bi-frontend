<script setup lang="ts">
const props = defineProps<{
  status: "success" | "danger";
}>();

const getStatusClass = (status: "success" | "danger") => {
  if (status === "success") {
    return "peidi-income-lightCircle-status-green";
  } else if (status === "danger") {
    return "peidi-income-lightCircle-status-red";
  }
  return "";
};
</script>

<template>
  <div>
    <span
      class="peidi-income-lightCircle-status-indicator inline-block h-2.5 w-2.5"
      :class="getStatusClass(props.status)"
    />
  </div>
</template>

<style lang="scss" scoped>
.peidi-income-lightCircle-status-indicator {
  border-radius: 50%;
  position: relative;

  &::before {
    content: "";
    background: inherit;
    opacity: 0.3;
    filter: blur(3px);
    border-radius: 50%;
    position: absolute;
    inset: -2px;
  }
}

.peidi-income-lightCircle-status-green {
  background: linear-gradient(135deg, #00c853, #009624);
  background: linear-gradient(
    135deg,
    lab(67.5649% -56.2955 48.2502),
    lab(50.0939% -56.6293 51.643)
  );
  animation: 2s ease-in-out infinite glow-pulse-green;
}

@keyframes glow-pulse-green {
  0%,
  100% {
    box-shadow:
      0 0 4px 1px #009c2499,
      0 0 8px 2px #009c244d,
      inset 0 0 3px #7bd77f80;
    box-shadow:
      0 0 4px 1px lab(55.921% -56.4854 50.0925 / 0.6),
      0 0 8px 2px lab(55.921% -56.4854 50.0925 / 0.3),
      inset 0 0 3px lab(78.6455% -42.0204 34.2976 / 0.5);
  }

  50% {
    box-shadow:
      0 0 8px 3px #009c24cc,
      0 0 16px 6px #009c2466,
      inset 0 0 5px #b5f0b599;
    box-shadow:
      0 0 8px 3px lab(55.921% -56.4854 50.0925 / 0.8),
      0 0 16px 6px lab(55.921% -56.4854 50.0925 / 0.4),
      inset 0 0 5px lab(89.6702% -27.9594 22.2162 / 0.6);
  }
}

.peidi-income-lightCircle-status-red {
  background: linear-gradient(135deg, #ff5252, #d50000);
  background: linear-gradient(
    135deg,
    lab(57.1752% 69.5963 43.0458),
    lab(39.7145% 70.0599 49.6254)
  );
  animation: 1.5s ease-in-out infinite glow-pulse-red;
}

@keyframes glow-pulse-red {
  0%,
  100% {
    box-shadow:
      0 0 4px 1px #d4092499,
      0 0 8px 2px #d409244d,
      inset 0 0 3px #ed756e80;
    box-shadow:
      0 0 4px 1px lab(45.5382% 69.8881 46.2994 / 0.6),
      0 0 8px 2px lab(45.5382% 69.8881 46.2994 / 0.3),
      inset 0 0 3px lab(63.7351% 46.9673 26.7836 / 0.5);
  }

  50% {
    box-shadow:
      0 0 8px 3px #d40924cc,
      0 0 16px 6px #d4092466,
      inset 0 0 5px #f8a49d99;
    box-shadow:
      0 0 8px 3px lab(45.5382% 69.8881 46.2994 / 0.8),
      0 0 16px 6px lab(45.5382% 69.8881 46.2994 / 0.4),
      inset 0 0 5px lab(75.8489% 31.0226 17.1029 / 0.6);
  }
}
</style>

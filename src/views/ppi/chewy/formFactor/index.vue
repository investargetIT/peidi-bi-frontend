<script setup lang="ts">
import { ref, watch } from "vue";
import NumCard from "../common/numCard.vue";
import ChartCard from "@/components/PdChart/index.vue";

const props = defineProps({
  formFactorData: {
    type: Object,
    required: true
  }
});

const formFactorCards = ref({
  name: "formFactorCards",
  title: "",
  text: "",
  option: {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        // Use axis to trigger tooltip
        type: "shadow" // 'shadow' as default; can also be 'line' or 'shadow'
      }
    },
    legend: {
      top: "bottom"
    },
    xAxis: {
      type: "value"
    },
    yAxis: {
      type: "category",
      data: [
        // "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
      ]
    },
    series: [
      // {
      //   name: "Direct",
      //   type: "bar",
      //   stack: "total",
      //   label: {
      //     show: true
      //   },
      //   emphasis: {
      //     focus: "series"
      //   },
      //   data: [320, 302, 301, 334, 390, 330, 320]
      // }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px",
    border: 0,
    height: "450px"
  }
});

watch(
  () => props.formFactorData,
  newVal => {
    // console.log("formFactorData", newVal);

    const seriesTemp = newVal.x.map((item, index) => ({
      name: item,
      type: "bar",
      stack: "total",
      label: {
        show: true
      },
      emphasis: {
        focus: "series"
      },
      data: newVal.y.map(yItem => newVal.data[yItem][item] || null)
    }));

    formFactorCards.value = {
      ...formFactorCards.value,
      option: {
        ...formFactorCards.value.option,
        yAxis: {
          ...formFactorCards.value.option.yAxis,
          data: [...newVal.y]
        },
        series: [...seriesTemp]
      },
      style: {
        ...formFactorCards.value.style,
        height: `${newVal.y.length * 200}px`
      }
    };
  }
);
</script>

<template>
  <NumCard
    title="Protein & Form Factor Trends"
    num="4"
    desc='Discover emerging protein trends by product form. Find opportunities like "Duck is growing in Jerky" or "Rabbit is underutilized in Soft Chews".'
  >
    <ChartCard
      :name="formFactorCards.name"
      :title="formFactorCards.title"
      :text="formFactorCards.text"
      :option="formFactorCards.option"
      :style="formFactorCards?.style"
    />
    <!-- <div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 bg-blue-50 rounded-lg">
          <h5 class="font-semibold text-blue-800 mb-1">Top Protein</h5>
          <p class="text-blue-700">--</p>
        </div>
        <div class="p-4 bg-purple-50 rounded-lg">
          <h5 class="font-semibold text-purple-800 mb-1">Emerging Trend</h5>
          <p class="text-purple-700">--</p>
        </div>
        <div class="p-4 bg-amber-50 rounded-lg">
          <h5 class="font-semibold text-amber-800 mb-1">Opportunity</h5>
          <p class="text-amber-700">--</p>
        </div>
      </div>
    </div> -->
  </NumCard>
</template>

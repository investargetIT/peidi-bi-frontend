<script setup lang="ts">
import { ref } from "vue";
import Progress from "../progress/index.vue";

const tableData = ref([
  {
    channel: "全渠道",
    targetAchievement: "",
    progress: "",
    yearOverYearGrowth: "5",
    childrenChannel: [
      {
        channel: "天猫"
      },
      {
        channel: "京东"
      },
      {
        channel: "抖音"
      },
      {
        channel: "哈宠"
      },
      {
        channel: "跨境电商"
      },
      {
        channel: "Vivaland"
      }
    ]
  },
  {
    channel: "线上",
    targetAchievement: "",
    progress: "",
    yearOverYearGrowth: "5",
    childrenChannel: [
      {
        channel: "销售一组"
      },
      {
        channel: "销售二组"
      },
      {
        channel: "销售三组"
      }
    ]
  },
  {
    channel: "线下",
    targetAchievement: "",
    progress: "",
    yearOverYearGrowth: "5",
    childrenChannel: [
      {
        channel: "销售一组"
      },
      {
        channel: "销售二组"
      },
      {
        channel: "销售三组"
      }
    ]
  }
]);
</script>

<template>
  <div>
    <el-table
      :data="tableData"
      style="width: 100%"
      :header-row-style="{ color: '#09090b' }"
      :preserve-expanded-content="false"
    >
      <el-table-column type="expand">
        <template #default="props">
          <div m="4">
            <el-table :data="props.row.childrenChannel" style="width: 100%">
              <el-table-column prop="channel" label="渠道" width="100">
                <template #default="scope">
                  <div class="flex items-center text-sm">
                    <div class="w-3 h-3 rounded-full bg-green-600 mr-1"></div>
                    <div class="text-[#0a0a0a]">
                      {{ scope.row.channel }}
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="" label="完成进度">
                <template #default="scope">
                  <Progress
                    :segments="[
                      { percentage: 30, color: '#4472C4', text: '3' }
                    ]"
                    height="25px"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="" label="周期进度">
                <template #default="scope">
                  <div>
                    <Progress
                      :segments="[
                        { percentage: 66, color: '#4472C4', text: '66%' }
                      ]"
                      height="25px"
                    />
                    <div class="w-[33%] mt-2">
                      <Progress
                        :segments="[
                          { percentage: 100, color: '#ED7D31', text: '33%' }
                        ]"
                        height="25px"
                      />
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="" label="同比" width="100">
                <template #default="scope">
                  <span class="text-center text-sm font-bold text-green-600">
                    5%
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="channel" label="渠道" width="100">
        <template #default="scope">
          <div class="flex items-center text-sm">
            <div class="w-3 h-3 rounded-full bg-green-600 mr-1"></div>
            <div class="font-bold text-[#0a0a0a]">{{ scope.row.channel }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="targetAchievement" label="目标达成" min-width="150">
        <template #default="scope">
          <div>
            <Progress
              :segments="[{ percentage: 100, color: '#4472C4', text: '3' }]"
              height="25px"
            />
            <div class="mt-2">
              <Progress
                :segments="[
                  { percentage: 20, color: '#C4A860', text: '0.2' },
                  { percentage: 20, color: '#7AB87F', text: '0.6' },
                  { percentage: 40, color: '#E0A0B0', text: '1.2' },
                  { percentage: 20, color: '#7BA3C9', text: '1' }
                ]"
                height="25px"
              />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="progress" label="进度" min-width="150">
        <div>
          <Progress
            :segments="[{ percentage: 66, color: '#4472C4', text: '66%' }]"
            height="25px"
          />
          <div class="w-[33%] mt-2">
            <Progress
              :segments="[{ percentage: 100, color: '#ED7D31', text: '33%' }]"
              height="25px"
            />
          </div>
        </div>
      </el-table-column>
      <el-table-column prop="yearOverYearGrowth" label="同比" width="100">
        <template #default="scope">
          <span class="text-center text-sm font-bold text-green-600">
            {{ scope.row.yearOverYearGrowth }}%
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

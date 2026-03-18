<script setup lang="ts">
import { computed, watch } from "vue";

const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  },
  calculateDivision: {
    type: Function,
    required: true
  },
  calculateRefundSales: {
    type: Function,
    required: true
  },
  calculateFeeRatio: {
    type: Function,
    required: true
  },
  selectedChannelType: {
    type: String,
    required: true
  }
});

// 计算属性 -计算全店销售额
const totalSalesAmount = computed(() => {
  // 遍历props.tableData item.payAmount
  // props.calculateRefundSales(item.payAmount, item.refundAmount) 之和
  const totalSales = props.tableData.reduce((acc, item: any) => {
    return acc + props.calculateRefundSales(item.payAmount, item.refundAmount);
  }, 0);
  return totalSales;
});
</script>

<template>
  <div>
    <el-card shadow="never" style="border-radius: 10px">
      <div class="text-[#0a0a0a] text-[14px] mb-[6px]">汇总数据表</div>
      <el-table
        :data="tableData"
        style="width: 100%"
        size="small"
        :header-cell-style="{ color: '#0a0a0a' }"
        border
      >
        <el-table-column prop="date" label="日期" width="" :resizable="false" />
        <el-table-column prop="" label="渠道" width="" :resizable="false">
          <template #default="scope">
            {{ props.selectedChannelType }}
          </template>
        </el-table-column>
        <el-table-column
          prop="productLine"
          label="产品线"
          width=""
          :resizable="false"
        />
        <el-table-column
          prop="productShortName"
          label="产品简称"
          width=""
          :resizable="false"
        />
        <el-table-column
          prop="productId"
          label="产品ID"
          width=""
          :resizable="false"
        />
        <el-table-column
          prop=""
          label="生参去退款销售额"
          width=""
          :resizable="false"
        >
          <template #default="scope">
            {{
              calculateRefundSales(
                scope.row?.payAmount,
                scope.row?.refundAmount
              ).toFixed(2)
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop=""
          label="生参销售占比"
          width=""
          :resizable="false"
        >
          <template #default="scope">
            <span v-if="selectedChannelType">
              {{
                (
                  calculateRefundSales(
                    scope.row?.payAmount,
                    scope.row?.refundAmount
                  ) / Number(totalSalesAmount)
                ).toFixed(2)
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop=""
          label="费比(退款后)"
          width=""
          :resizable="false"
        >
          <template #default="scope">
            {{
              calculateFeeRatio(
                scope.row?.payAmount,
                scope.row?.refundAmount,
                scope.row?.costAmount
              )
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="costAmount"
          label="站内消耗"
          width=""
          :resizable="false"
        >
          <template #default="scope">
            <span v-if="selectedChannelType === '品专'">
              {{
                (
                  2534 /
                  (calculateRefundSales(
                    scope.row?.payAmount,
                    scope.row?.refundAmount
                  ) /
                    Number(totalSalesAmount))
                ).toFixed(2)
              }}
            </span>
            <span v-else-if="selectedChannelType === '超级直播'">
              {{
                (
                  scope.row?.costAmount /
                  (calculateRefundSales(
                    scope.row?.payAmount,
                    scope.row?.refundAmount
                  ) /
                    Number(totalSalesAmount))
                ).toFixed(2)
              }}
            </span>
            <span v-else>
              {{ scope.row?.costAmount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="impressions"
          label="展现量"
          width=""
          :resizable="false"
        />
        <el-table-column
          prop="clicks"
          label="点击量"
          width=""
          :resizable="false"
        />
        <el-table-column
          prop="totalOrders"
          label="总成交笔数"
          width=""
          :resizable="false"
        />
        <el-table-column
          prop="totalSalesAmount"
          label="总成交金额"
          width=""
          :resizable="false"
        />
        <el-table-column
          prop="directOrders"
          label="直接成交笔数"
          width=""
          :resizable="false"
        />
        <el-table-column
          prop="directSalesAmount"
          label="直接成交金额"
          width=""
          :resizable="false"
        />
        <el-table-column
          prop="buyersCount"
          label="成交人数"
          width=""
          :resizable="false"
        />
        <el-table-column
          prop="newBuyersCount"
          label="成交新客"
          width=""
          :resizable="false"
        />
        <el-table-column prop="" label="点击成本" width="" :resizable="false">
          <template #default="scope">
            {{
              calculateDivision(scope.row?.costAmount, scope.row?.impressions)
            }}
          </template>
        </el-table-column>
        <el-table-column prop="" label="点击率" width="" :resizable="false">
          <template #default="scope">
            {{
              calculateDivision(scope.row?.clicks, scope.row?.impressions, true)
            }}
          </template>
        </el-table-column>
        <el-table-column prop="" label="转化率" width="" :resizable="false">
          <template #default="scope">
            {{
              calculateDivision(scope.row?.buyersCount, scope.row?.clicks, true)
            }}
          </template>
        </el-table-column>
        <el-table-column prop="" label="ROI" width="" :resizable="false">
          <template #default="scope">
            {{
              calculateDivision(
                scope.row?.totalSalesAmount,
                scope.row?.costAmount
              )
            }}
          </template>
        </el-table-column>
        <el-table-column prop="" label="直接ROI" width="" :resizable="false">
          <template #default="scope">
            {{
              calculateDivision(
                scope.row?.directSalesAmount,
                scope.row?.costAmount
              )
            }}
          </template>
        </el-table-column>
        <el-table-column prop="" label="直接客单" width="" :resizable="false">
          <template #default="scope">
            {{
              calculateDivision(
                scope.row?.directSalesAmount,
                scope.row?.directOrders
              )
            }}
          </template>
        </el-table-column>
        <el-table-column prop="" label="拉新成本" width="" :resizable="false">
          <template #default="scope">
            {{
              calculateDivision(
                scope.row?.costAmount,
                scope.row?.newBuyersCount
              )
            }}
          </template>
        </el-table-column>
        <el-table-column prop="" label="新客占比" width="" :resizable="false">
          <template #default="scope">
            {{
              calculateDivision(
                scope.row?.newBuyersCount,
                scope.row?.buyersCount,
                true
              )
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="productUrl"
          label="产品链接"
          width=""
          fixed="right"
          :resizable="false"
        >
          <template #default="scope">
            <a
              v-if="scope.row.productUrl"
              :href="scope.row.productUrl"
              target="_blank"
              rel="noopener noreferrer"
              style="color: #1890ff; text-decoration: underline"
              @click.stop
            >
              查看链接
            </a>
            <span v-else style="color: #999">无链接</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

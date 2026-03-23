<script setup lang="ts">
interface dataType {
  name: string;
  old: Array<any>;
  new: Array<any>;
}
const props = defineProps({
  data: {
    type: Array as PropType<dataType>,
    required: true
  }
});
</script>

<template>
  <div class="peidi-littleRedBook-warpper">
    <table>
      <thead>
        <tr>
          <th colspan="1" rowspan="2" class="border-right-thick">系列</th>
          <th colspan="8" class="border-right-thick">小红书爵宴店铺老货盘</th>
          <th colspan="8">小红书目前货盘</th>
        </tr>
        <tr>
          <th>品名</th>
          <th>商品ID</th>
          <th>图片</th>
          <th>支付金额</th>
          <th>访客数</th>
          <th>订单数</th>
          <th>退款后支付金额</th>
          <th class="border-right-thick">退款率</th>

          <th>品名</th>
          <th>商品ID</th>
          <th>图片</th>
          <th>支付金额</th>
          <th>访客数</th>
          <th>订单数</th>
          <th>退款后支付金额</th>
          <th>退款率</th>
        </tr>
      </thead>

      <tbody>
        <template
          v-for="(item, groupIndex) in data"
          :key="`${groupIndex}-${item?.name}`"
        >
          <tr
            v-for="(oldItem, index) in item.old"
            :key="index"
            :class="[
              Number(groupIndex) % 2 === 0 ? 'even-group' : 'odd-group',
              index === 0 ? 'group-first-row' : '',
              index === item.old.length - 1 ? 'group-last-row' : ''
            ]"
          >
            <td
              v-if="index === 0"
              :rowspan="item.old.length"
              class="border-right-thick"
            >
              <span class="font-bold">{{ item?.name }}</span>
            </td>

            <td>{{ oldItem?.productTitle }}</td>
            <td>{{ oldItem?.productId }}</td>
            <td>
              <el-image
                v-if="oldItem?.productImage"
                style="width: 50px; height: 50px"
                :src="oldItem?.productImage"
                :preview-src-list="[oldItem?.productImage]"
                fit="contain"
              />
              <span v-else />
            </td>
            <td>{{ oldItem?.paymentAmount }}</td>
            <td>{{ oldItem?.visitorCount }}</td>
            <td>{{ oldItem?.orderCount }}</td>
            <td>{{ oldItem?.refundedPaymentAmount }}</td>
            <td class="border-right-thick">{{ oldItem?.refundRate }}</td>

            <td>{{ item.new[index]?.productTitle }}</td>
            <td>{{ item.new[index]?.productId }}</td>
            <td>
              <el-image
                v-if="item.new[index]?.productImage"
                style="width: 50px; height: 50px"
                :src="item.new[index]?.productImage"
                :preview-src-list="[item.new[index]?.productImage]"
                fit="contain"
              />
              <span v-else />
            </td>
            <td>{{ item.new[index]?.paymentAmount }}</td>
            <td>{{ item.new[index]?.visitorCount }}</td>
            <td>{{ item.new[index]?.orderCount }}</td>
            <td>{{ item.new[index]?.refundedPaymentAmount }}</td>
            <td>{{ item.new[index]?.refundRate }}</td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.peidi-littleRedBook-warpper {
  height: calc(100vh - 100px);
  overflow-x: auto;

  table {
    width: 100%;
    overflow: hidden;
    border-collapse: collapse;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);

    thead {
      position: sticky;
      top: 0;

      tr {
        background-color: #f5f7fa;

        th {
          padding: 12px 15px;
          font-size: 12px;
          font-weight: 600;
          color: #333;
          text-align: left;
          border-right: 1px solid #f2f6fc;
          border-bottom: 2px solid #ebeef5;

          &:first-child {
            border-left: none;
          }
        }
      }
    }

    tbody {
      tr {
        &.even-group {
          background-color: #fff;

          td {
            background-color: #fff;
          }
        }

        &.odd-group {
          background-color: #fafafa;

          td {
            background-color: #fafafa;
          }
        }

        &.group-first-row {
          td {
            border-top: 3px solid #dcdfe6;
          }
        }

        &.group-last-row {
          td {
            border-bottom: 3px solid #dcdfe6;
          }
        }

        // &:hover {
        //   background-color: #f5f7fa !important;

        //   td {
        //     background-color: transparent !important;
        //   }
        // }

        td {
          padding: 12px 15px;
          font-size: 12px;
          color: #606266;
          border-right: 1px solid #f2f6fc;
          border-bottom: 1px solid #ebeef5;

          &:first-child {
            font-weight: 500;
            color: #333;
          }

          &.border-right-thick {
            border-right: 3px solid #dcdfe6;
          }
        }
      }
    }

    th {
      &.border-right-thick {
        border-right: 3px solid #dcdfe6;
      }
    }
  }
}
</style>

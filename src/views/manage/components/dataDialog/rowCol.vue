<script setup lang="ts"></script>

<template>
  <el-row :gutter="20">
    <el-col :span="12">
      <slot name="left" />
    </el-col>
    <el-col :span="12">
      <slot name="right" />
    </el-col>
  </el-row>
</template>

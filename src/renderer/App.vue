<template>
  <div class="container">
    <h2>提交信息</h2>
    <!-- 前置提交类型 -->
    <el-row :gutter="16" v-if="preCommitTypes.length">
      <el-col :span="8" v-for="(field, index) in preCommitTypes" :key="index">
        <div class="form-group">
          <label>{{ field.title }}</label>
          <el-select clearable :offset="2" v-model="formData.fields[field.title]" :placeholder="`选择${field.title}`"
            style="width: 100%" :show-arrow="false">
            <el-option v-for="item in field.options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
      </el-col>
    </el-row>

    <!-- 附加提交类型 -->
    <div v-if="appendCommitTypes.length" class="form-section">
      <div v-for="(field, index) in appendCommitTypes" :key="'append-' + index" class="form-group">
        <el-checkbox v-model="formData.fields[field.title]">
          {{ field.title }}
        </el-checkbox>
      </div>
    </div>

    <!-- 提交描述 -->
    <div class="form-section">
      <div class="form-group">
        <label>提交描述</label>
        <textarea v-model="formData.description" class="form-control" placeholder="请输入提交描述" rows="3"></textarea>
      </div>
    </div>

    <!-- 预览 -->
    <div class="preview-section">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0;">预览</h3>
        <button class="btn-copy" @click="copyToClipboard" :disabled="!formattedMessage" title="复制到剪贴板">
          📋 复制
        </button>
      </div>
      <div class="preview-box">{{ formattedMessage }}</div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button class="btn btn-secondary" @click="cancel">取消</button>
      <button class="btn btn-primary" @click="submit">提交</button>
    </div>
  </div>

</template>

<script setup>
  import { reactive, onMounted, onUnmounted, ref, computed } from 'vue'
  import { ElCol, ElRow, ElSelect, ElOption, ElCheckbox } from 'element-plus'

  const formData = reactive({
    fields: {},
    description: ''
  })

  const preCommitTypes = ref([])
  const appendCommitTypes = ref([])

  // 计算格式化后的提交消息
  const formattedMessage = computed(() => {
    let message = ''

    // 处理前置提交类型
    preCommitTypes.value.forEach(field => {
      const value = formData.fields[field.title]
      if (value) {
        const prefix = field.prefix || ''
        const suffix = field.suffix || ''
        message += `${prefix}${value}${suffix}`
      }
    })

    // 添加描述
    if (formData.description) {
      message += formData.description
    }

    // 处理附加提交类型
    appendCommitTypes.value.forEach(field => {
      const value = formData.fields[field.title]
      if (value && field['true-value']) {
        message += field['true-value']
      }
    })

    return message
  })

  // 提交消息
  const submit = async () => {
    try {
      if (!formData.description.trim()) {
        alert('请填写提交描述')
        return
      }

      const result = await window.electronAPI.submitCommitMessage(formattedMessage.value)
      if (result) {
        window.close()
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('提交失败，请重试')
    }
  }

  // 取消提交
  const cancel = async () => {
    try {
      await window.electronAPI.cancelCommit()
    } catch (error) {
      console.error('取消提交失败:', error)
    }
  }

  // 获取配置
  const loadConfig = async () => {
    try {
      if (window.electronAPI && window.electronAPI.getConfig) {
        const configData = await window.electronAPI.getConfig()
        console.log('加载配置:', configData)
        preCommitTypes.value = configData.preCommitTypes || []
        appendCommitTypes.value = configData.appendCommitTypes || []
      }
    } catch (error) {
      console.error('获取配置失败:', error)
    }
  }

  // 复制到剪贴板
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage.value)
      alert('已复制到剪贴板！')
    } catch (error) {
      console.error('复制失败:', error)
      // 降级方案：使用 document.execCommand
      const textarea = document.createElement('textarea')
      textarea.value = formattedMessage.value
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      alert('已复制到剪贴板！')
    }
  }

  // 监听原始消息
  onMounted(() => {
    if (window.electronAPI && window.electronAPI.onOriginalMessage) {
      window.electronAPI.onOriginalMessage((event, message) => {
        console.log('收到原始消息:', message)

        // 将原始消息设置为描述
        formData.description = message
      })
    }

    loadConfig()
  })

  onUnmounted(() => {
    if (window.electronAPI && window.electronAPI.removeAllListeners) {
      window.electronAPI.removeAllListeners('original-message')
    }
  })
</script>

<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #f5f5f5;
  }

  #app {
    padding: 24px;
    min-height: 100vh;
    background: white;
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
  }

  h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
  }

  .form-section {
    margin-bottom: 20px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #333;
  }

  .form-control {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  .form-control:focus {
    outline: none;
    border-color: #007acc;
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
  }

  textarea.form-control {
    resize: vertical;
    min-height: 60px;
  }

  .preview-section {
    margin: 20px 0;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 4px;
    border-left: 4px solid #007acc;
  }

  .preview-section h3 {
    margin-bottom: 10px;
    color: #333;
  }

  .preview-box {
    padding: 10px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }

  .btn-primary {
    background: #007acc;
    color: white;
  }

  .btn-primary:hover {
    background: #005a9e;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background: #545b62;
  }

  .btn-copy {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 12px;
  }

  .btn-copy:hover:not(:disabled) {
    background: #f0f0f0;
  }

  .btn-copy:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .loading {
    text-align: center;
    padding: 40px;
    font-size: 16px;
    color: #666;
  }
</style>

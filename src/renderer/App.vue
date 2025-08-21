<template>
  <div id="app">
    <div class="container">     
      
      <div class="form-section">
        <div class="form-group">
          <label>提交类型:</label>
          <select v-model="commitType" class="form-control">
            <option value="feat">✨ feat - 新功能</option>
            <option value="fix">🐛 fix - 修复bug</option>
            <option value="docs">📝 docs - 文档更新</option>
            <option value="style">💄 style - 代码格式</option>
            <option value="refactor">♻️ refactor - 重构</option>
            <option value="perf">⚡️ perf - 性能优化</option>
            <option value="test">✅ test - 测试相关</option>
            <option value="chore">🔧 chore - 构建/工具</option>
          </select>
        </div>

        <div class="form-group">
          <label>作用域 (可选):</label>
          <input 
            v-model="scope" 
            type="text" 
            placeholder="例如: auth, ui, database"
            class="form-control"
          >
        </div>

        <div class="form-group">
          <label>描述:</label>
          <textarea 
            v-model="description" 
            placeholder="简短的描述性提交信息"
            class="form-control"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" v-model="isBreakingChange">
            这是一个破坏性变更
          </label>
        </div>

        <div v-if="isBreakingChange" class="form-group">
          <label>破坏性变更说明:</label>
          <textarea 
            v-model="breakingChangeDescription" 
            placeholder="描述破坏性变更的细节"
            class="form-control"
            rows="2"
          ></textarea>
        </div>
      </div>

      <div class="preview-section">
        <h3>预览:</h3>
        <div class="preview-box">
          {{ formattedMessage }}
        </div>
      </div>

      <div class="actions">
        <button @click="submit" class="btn btn-primary">提交</button>
        <button @click="cancel" class="btn btn-secondary">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'App',
  setup() {
    const commitType = ref('feat')
    const scope = ref('')
    const description = ref('')
    const isBreakingChange = ref(false)
    const breakingChangeDescription = ref('')

    // 计算格式化后的提交消息
    const formattedMessage = computed(() => {
      let message = commitType.value
      
      if (scope.value) {
        message += `(${scope.value})`
      }
      
      message += ': '
      
      if (isBreakingChange.value) {
        message += 'BREAKING CHANGE: '
      }
      
      message += description.value
      
      if (isBreakingChange.value && breakingChangeDescription.value) {
        message += `\n\n${breakingChangeDescription.value}`
      }
      
      return message
    })

    // 提交消息
    const submit = async () => {
      try {
        if (!description.value.trim()) {
          alert('请填写提交描述')
          return
        }

        const result = await window.electronAPI.submitCommitMessage(formattedMessage.value)
        if (result) {
          // 成功提交，关闭应用
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

    // 监听原始消息
    onMounted(() => {
      if (window.electronAPI && window.electronAPI.onOriginalMessage) {
        window.electronAPI.onOriginalMessage((event, message) => {
          if (message) {
            description.value = message
          }
        })
      }
    })

    onUnmounted(() => {
      if (window.electronAPI && window.electronAPI.removeAllListeners) {
        window.electronAPI.removeAllListeners('original-message')
      }
    })

    return {
      commitType,
      scope,
      description,
      isBreakingChange,
      breakingChangeDescription,
      formattedMessage,
      submit,
      cancel
    }
  }
}
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
  padding: 20px;
  min-height: 100vh;
  background: white;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

h1 {
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
</style>

# Node.js Advanced Multithreading System

A sophisticated Node.js application demonstrating advanced multithreading capabilities with memory management, virtual caching, and real-time monitoring.

## 🚀 Features

- **Worker Threads Management**: Efficient handling of multiple Node.js worker threads
- **Virtual Memory System**: 8 managed memory stacks with automatic optimization
- **Smart Caching**: Virtual cache system with socket-based communication
- **Queue Buffer System**: Efficient data queueing and processing
- **Real-time Monitoring**: Advanced memory and performance monitoring
- **Colored Logging**: Comprehensive logging system with color-coded output
- **Health Checks**: Automatic system health monitoring and reporting

## 🏗 Architecture

The system consists of several key components:

### Core Components
1. **NodeFragment**: Worker thread implementations for parallel processing
2. **NodeQueueBuffer**: Queue management system for data processing
3. **VirtualCache**: Caching layer with memory controller integration
4. **MemoryController**: Advanced memory management system
5. **SocketController**: Internal communication management
6. **MemoryMonitor**: Real-time performance and health monitoring
7. **Logger**: Advanced logging system with color support

### Memory Management
- 8 Virtual Memory Stacks (alternating Function and Static types)
- Automatic memory optimization and redistribution
- Critical memory handling and error recovery
- Lock timeout protection

## 🛠 Installation

```bash
git clone https://github.com/savisxss/node-threading.git
cd node-threading
npm install
```

## 💻 Usage

To run the application:

```bash
node test.js
```

This will execute the test suite and display the memory monitoring report.

### Example Output:
```
[Fragment #1] Evaluating: Hello
[Fragment #2] Evaluating: from
[Fragment #3] Evaluating: Node.js
[Fragment #4] Evaluating: Threading!

=== Memory Stacks Monitoring Report ===

Stack #1 Report:
Health Status: healthy
Summary: {...}
Operations: {...}
Current Memory Usage: 0 / 1000
```

## 🔧 Configuration

Key configuration options in `MemoryController.js`:

```javascript
this.maxErrorThreshold = 5;
this.lockTimeoutDuration = 5000;
this.maxStackSize = 1000;
this.criticalMemoryThreshold = 0.9;
```

## 📊 Monitoring

The system includes comprehensive monitoring capabilities:
- Real-time memory usage tracking
- Operation performance metrics
- Error rate monitoring
- Stack health status
- Automatic health checks every 60 seconds

## 🔍 Memory Stack Types

The system manages two types of memory stacks:
- **F (Function)**: For function-type data
- **S (Static)**: For static data storage

## 🔄 Data Flow

1. Worker threads process data in parallel
2. Processed data is queued in NodeQueueBuffer
3. Data is cached through VirtualCache
4. MemoryController manages data storage and optimization
5. SocketController handles internal communication
6. MemoryMonitor tracks system health and performance

## ⚠️ Error Handling

The system includes robust error handling:
- Automatic stack recovery
- Lock timeout protection
- Memory overflow prevention
- Error rate monitoring
- Automatic data redistribution

## 📝 Logging

The system uses color-coded logging for different operations:
- Yellow: Fragment operations
- Green: Copy operations
- Purple: Socket operations
- Gray: Write operations
- Cyan: Stack operations

## 🧪 Testing

Run the test suite to verify system functionality:

```bash
node test.js
```

The test will:
- Initialize the system
- Process test data
- Generate a comprehensive monitoring report
- Display system health status

## 🔐 Safety Features

- Lock timeout protection
- Memory stack optimization
- Error threshold monitoring
- Critical memory handling
- Automatic data redistribution
- Health status monitoring

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🛡️ System Requirements

- Node.js (version 12 or higher)
- Sufficient system memory for stack operations
- Multi-core processor recommended for optimal performance

## 🎯 Future Improvements

- Add cluster support for multi-machine deployment
- Implement persistent storage integration
- Add more monitoring metrics
- Enhance error recovery mechanisms
- Add support for custom stack types
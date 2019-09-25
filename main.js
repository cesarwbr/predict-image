(function () {
  const video = document.getElementById('webcam')
  const status = document.getElementById('status')
  const btn1 = document.getElementById('btn1')
  const btn2 = document.getElementById('btn2')
  const btnTestPredictions = document.getElementById('btn-test-predictions')
  let knn
  let mobilenetModule
  let testPrediction = false
  let timer
  let training = true
  let recordSamples = false
  let trainingPress


  loadClassifierAndModel()
  initializeWebcam()
  setupButtonEvents()

  function initializeWebcam () {
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
      .then(stream => {
        video.srcObject = stream
        video.width = 400
        video.height = 300
      })
  }

  async function loadClassifierAndModel () {
    knn = window.knnClassifier.create()
    mobilenetModule = await window.mobilenet.load()
    console.log('model loaded')
    start()
  }

  function start () {
    timer = window.requestAnimationFrame(animate)
  }

  async function animate () {
    if (recordSamples) {
      const image = window.tf.browser.fromPixels(video)

      let logits
      const infer = () => mobilenetModule.infer(image, 'conv_preds')

      if (trainingPress !== -1) {
        logits = infer()

        knn.addExample(logits, trainingPress)
      }

      const numClasses = knn.getNumClasses()

      if (testPrediction) {
        training = false
        if (numClasses > 0) {
          logits = infer()

          const res = await knn.predictClass(logits, 10)

          if (res.confidences[0] > 0.6) {
            status.innerHTML = `👆 I'm ${res.confidences[0] * 100} sure!`
          } else if (res.confidences[1] > 0.6) {
            status.innerHTML = `✌️ I'm ${res.confidences[1] * 100} sure!`
          } else {
            status.innerHTML = 'I don\'t know'
          }
        }
      }

      // if (training) {
      //   const exampleCount = knn.getClassExampleCount()

      //   console.log('exampleCount 1:', exampleCount[0] || 0)
      //   console.log('exampleCount 2:', exampleCount[1] || 0)
      // }

      image.dispose()
      if (logits) {
        logits.dispose()
      }
    }
    timer = window.requestAnimationFrame(animate)
  }

  function setupButtonEvents () {
    btn1.onmousedown = () => {
      trainingPress = 0
      recordSamples = true
    }
    btn1.onmouseup = () => (trainingPress = -1)

    btn2.onmousedown = () => {
      trainingPress = 1
      recordSamples = true
    }
    btn2.onmouseup = () => (trainingPress = -1)

    btnTestPredictions.addEventListener('click', () => {
      testPrediction = true
    })
  }

})()
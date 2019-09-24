(function () {
  const img = document.getElementById('image');
  const status = document.getElementById('status')
  const btn = document.getElementById('btn')

  async function predictImage () {
    status.innerHTML = 'Model loading...'
    const model = await mobilenet.load()

    status.innerHTML = 'Model is loaded!'

    const predictions = await model.classify(img)
    status.innerHTML = predictions[0].className
  }


  function loadImage (url) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest()
      xhr.onload = function() {
          var reader = new FileReader()
          reader.onloadend = function() {
              resolve(reader.result)
          }
          reader.readAsDataURL(xhr.response)
      }
      xhr.open('GET', url)
      xhr.responseType = 'blob'
      xhr.send()
    })
  }

  async function predictNewImage () {
    img.style.display = 'none'
    status.innerHTML = 'Image loading...'
    const base64 = await loadImage('https://picsum.photos/500/300')

    img.setAttribute('src', base64)
    img.style.display = 'inline'

    predictImage()
  }

  btn.addEventListener('click', () => {
    predictNewImage()
  })

  predictNewImage()
})()
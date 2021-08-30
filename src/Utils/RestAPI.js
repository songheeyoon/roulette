// RestAPI 정의부분
const serverURL = 'https://picktoon.com/';
const hostURL = serverURL;

const futch = (url, opts = {}, onProgress) => {
    // console.log(url, opts)
    return new Promise((res, rej) => {
        var xhr = new XMLHttpRequest();
        xhr.open(opts.method || 'get', url);
        for (var k in opts.headers || {})
            xhr.setRequestHeader(k, opts.headers[k]);
        xhr.onload = e => res(e.target);
        xhr.onerror = rej;
        if (xhr.upload && onProgress)
            xhr.upload.onprogress = onProgress; // event.loaded / event.total * 100 ; //event.lengthComputable
        xhr.send(opts.body);
    });
}

const formDataCall = (subUrl, method, body, headers, callBack, isFullLink = false) => {
    let link = isFullLink ? subUrl : hostURL + subUrl

    let start = Date.now();

    futch(link, {
        method: method,
        body: body,
        headers: headers
    }, (progressEvent) => {
        const progress = progressEvent.loaded / progressEvent.total;
        // console.log("this is progress : ", progress);

    }).then(function (resJson) {
        // console.log('Here is response from server!>>>>>|||>>|:>');

        try {
            let res = JSON.parse(resJson.response)
            // console.log('after parsing: ', res)
            callBack(res, null);
            
            let end = Date.now()
            // console.log("end date is ", end)
            // console.log(`Execution time: ${end - start} ms`);

        } catch (exception) {
            console.log(exception);
            callBack(null, exception);
        }

    }, (err) => {

        console.log('parsing err ', err)
        callBack(null, err);
    }
    );
}


const RestAPI = {

 
    preProcess: (curUserIx) => {
        let data = new FormData()
        data.append('user_ix', curUserIx)
        data.append('mode', 'pre_process')

        return new Promise((resolve, reject) => {
            formDataCall('api_webtoon_ok', 'post', data, null, (res, err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res)
                }
            })
        })
    },
    getHomeWebtoons: (curUserIx) => {
        let data = new FormData()
        data.append('user_ix', curUserIx)

        return new Promise((resolve, reject) => {
            formDataCall('api_home', 'post', data, null, (res, err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res)
                }
            })
        })
    },
    getGenre: (value) => {
        let data = new FormData()
        data.append('genre', value)
        data.append('mode', 'roulette')
        console.log(value,"api")
        return new Promise((resolve, reject) => {
            formDataCall('api_webtoon_ok', 'post', data, null, (res, err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res)
                }
            })
        })
    },
 
}

export default RestAPI

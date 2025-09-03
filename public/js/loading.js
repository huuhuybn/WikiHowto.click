function progressShow() {
    console.log("show progress");
    const progress = document.getElementById("progress"), progressBar = document.getElementById("progressbar");
    sessionStorage.setItem("progressActive", "true");
    progress.style.visibility = "visible";
    progress.style.display = "block";
    progressBar.style.width = "0%";
    setTimeout(() => {
        progressBar.style.width = "48%";
        console.log("Set to 48%")
    }, 250);
    let t = 48, e = 2;
    const interval = setInterval(() => {
        t += 48 / e;
        const widthValue = Math.min(t, 98.5) + "%";
        e *= 2;
        console.log("Progress: " + widthValue);
        progressBar.style.width = widthValue;
        if (t >= 98.5) {
            progressBar.style.width = "98.5%";
            clearInterval(interval);
            console.log("Reached 98.5%, stopping.")
        }
    }, 600)
}
document.getElementById('myForm').onsubmit = function (event) {
    progressShow()
};

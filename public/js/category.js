let category = document.querySelectorAll(".filter");
let gotCategory;
category.forEach((element)=>{
    element.addEventListener("click", ()=>{
        gotCategory = element.lastElementChild.innerHTML;   
    });
});
// module.exports.gotCategory;

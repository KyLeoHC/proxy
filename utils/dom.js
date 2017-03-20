let dom = {
    parse: (content) => {
        //content = content.replace('<body>', '<body><script type="text/javascript">alert("你被入侵了");</script>');
        content = content.replace('<body>', '<body><script type="text/javascript" src="http://freeui.org/imageViewer/build/debuggap.js"></script>');
        console.log(content);
        return content;
    }
};

module.exports = dom;
Game.Message = {
    attr: {
        freshMessages: [],
        staleMessages: [],
        archivedMessages: [],
        archivedMessageLimit: 200
    },
    render: function(display) {
        display.clear();
        var dispRowMax = display._options.height - 1;
        var dispColMax = display._options.width - 1;
        var dispRow = dispRowMax;
        var freshIdx = 0;
        var staleIdx = 0;
        var fLen = this.attr.freshMessages.length - 1;
        var sLen = this.attr.staleMessages.length;

        for (freshIdx = fLen; freshIdx >= 0 && dispRow >= 0; freshIdx--) {
            dispRow -= display.drawText(1, dispRow, '%c{#ddd}' + this.attr.freshMessages[freshIdx], dispColMax);
        }
        for (staleIdx = 0; staleIdx < sLen && dispRow >= 0; staleIdx++) {
            dispRow -= display.drawText(1, dispRow, '%c{#999}' + this.attr.staleMessages[staleIdx], dispColMax);
        }
    },
    ageMessages: function() {
        // archive oldest stale message
        if (this.attr.staleMessages[0] != null) {
            this.attr.archivedMessages.unshift(this.attr.staleMessages.pop());
        }

        // dump messages over limit
        var aLen = this.attr.archivedMessages.length;
        while (aLen > this.attr.archivedMessageLimit) {
            this.attr.archivedMessages.pop();
            aLen--;
        }

        // move fresh messages to stale
        while (this.attr.freshMessages[0] != null) {
            this.attr.staleMessages.unshift(this.attr.freshMessages.shift());
        }
    },
    send: function(msg) {
        this.attr.freshMessages.push(msg);
    },
    clear: function() {
        this.attr.freshMessages = [];
        this.attr.staleMessages = [];
    }
};

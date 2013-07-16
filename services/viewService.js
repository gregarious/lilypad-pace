// maintains shared viewstate
app.service('viewService', function() {
    return {
        data_view: null,
        get currentView() {return this.data_view},
        set currentView(newView) {
            // if the view has changed, old parameters are irrelevant
            if (this.data_view !== newView) {
                this.data_view = newView;
                this.parameters = {};
            }
        },
        parameters: {},
        disabled: false
    };
});

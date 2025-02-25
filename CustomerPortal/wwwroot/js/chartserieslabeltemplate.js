function chartSeriesLabelTemplate(context) {
    return context.category + " - " + (context.percentage * 100).toFixed(2) + "%";
}
